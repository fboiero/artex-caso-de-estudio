##! Detección de indicadores de ARTEX (defensivo, para Zeek).
##! Carga: `zeek -i <iface> artex.zeek`  o agregalo a local.zeek.
##! Detecta: consola 8787/8788, egress a notificadores/LLM por SNI, y ráfaga agéntica (fan-out).
##! Solo observa tráfico; no ataca. Ajustá umbrales/allowlists a tu entorno.

@load base/frameworks/notice
@load base/protocols/conn
@load base/protocols/ssl
@load base/frameworks/sumstats

module ARTEX;

export {
    redef enum Notice::Type += {
        Console_Port,      ##< conexión a la consola ARTEX (8787/8788)
        Notifier_Egress,   ##< SNI hacia un notificador (Telegram/DingTalk/…)
        LLM_Egress,        ##< SNI hacia una API de LLM (DeepSeek/GLM/Grok)
        Agentic_Burst,     ##< muchos destinos únicos desde un mismo origen (fan-out)
    };

    const console_ports: set[port] = { 8787/tcp, 8788/tcp } &redef;
    const notifier_sni: set[string] = {
        "api.telegram.org", "oapi.dingtalk.com",
        "qyapi.weixin.qq.com", "open.feishu.cn"
    } &redef;
    const llm_sni: set[string] = {
        "api.deepseek.com", "open.bigmodel.cn", "api.x.ai"
    } &redef;

    const burst_window  = 10sec &redef;   ##< ventana de observación
    const burst_threshold = 60.0 &redef;  ##< destinos únicos por origen que disparan la alerta
}

# 1) Consola ARTEX en 8787/8788
event connection_state_remove(c: connection) {
    if ( c$id$resp_p in console_ports )
        NOTICE([$note=Console_Port, $conn=c,
                $msg=fmt("Conexión a consola ARTEX %s:%s", c$id$resp_h, c$id$resp_p)]);
}

# 2) Egress a notificadores / APIs de LLM (por SNI del handshake TLS)
event ssl_extension_server_name(c: connection, is_client: bool, names: string_vec) {
    for ( i in names ) {
        local sn = to_lower(names[i]);
        if ( sn in notifier_sni )
            NOTICE([$note=Notifier_Egress, $conn=c,
                    $msg=fmt("Egress a notificador: %s", sn)]);
        else if ( sn in llm_sni )
            NOTICE([$note=LLM_Egress, $conn=c,
                    $msg=fmt("Egress a API LLM: %s", sn)]);
    }
}

# 3) Ráfaga agéntica: destinos únicos por origen en una ventana corta
event zeek_init() {
    local r = SumStats::Reducer($stream="artex.fanout", $apply=set(SumStats::UNIQUE));
    SumStats::create([
        $name="artex-fanout",
        $epoch=burst_window,
        $reducers=set(r),
        $threshold=burst_threshold,
        $threshold_val(key: SumStats::Key, result: SumStats::Result) = {
            return result["artex.fanout"]$unique + 0.0;
        },
        $threshold_crossed(key: SumStats::Key, result: SumStats::Result) = {
            NOTICE([$note=Agentic_Burst, $src=key$host,
                    $msg=fmt("Ráfaga agéntica: %d destinos únicos en %s desde %s",
                             result["artex.fanout"]$unique, burst_window, key$host)]);
        }
    ]);
}

event connection_established(c: connection) {
    SumStats::observe("artex.fanout", [$host=c$id$orig_h], [$str=cat(c$id$resp_h)]);
}
