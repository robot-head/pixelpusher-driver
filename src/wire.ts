import Struct from "struct";

/*
struct pusher_broadcast {
  uint8 mac[6];
  uint8 ip[4];
  uint8 deviceype;
  uint8 protocol;
  uint16 vid;
  uint16 pid;
  uint16 hardware_rev;
  uint16 software_rev;
  uint32 link_speed;
  uint8  strips_attached;
  uint8  max_strips_per_packet;
  uint16 pixels_per_strip;
  uint32 update_period;
  uint32 powerotal;
  uint32 delta_sequence;
  int32 controller_ordinal;
  int32 group_ordinal;
  uint16 artnet_universe;
  uint16 artnet_channel;
  uint16 my_port;
  uint16 padding1;
  uint8 strip_flags[8];
  uint16 padding2;
  uint32 pusher_flags;
  uint32 segments;
  uint32 power_domain;
  uint8 last_driven_ip[4];
  uint16 last_driven_port;
}
*/
export const DeviceType = {
  ETHERDREAM: 0,
  LUMIABRIDGE: 1,
  PIXELPUSHER: 2
};

export function PusherBroadcast(): Struct {
  return new Struct()
    .array("mac", 6, "word8")
    .array("ip", 4, "word8")
    .word8("devicetype")
    .word8("protocol")
    .word16Ule("vid")
    .word16Ule("pid")
    .word16Ule("hardware_rev")
    .word16Ule("software_rev")
    .word32Ule("link_speed")
    .word8("strips_attached")
    .word8("max_strips_per_packet")
    .word16Ule("pixels_per_strip")
    .word32Ule("update_period")
    .word32Ule("powertotal")
    .word32Ule("delta_sequence")
    .word32Sle("controller_ordinal")
    .word32Sle("group_ordinal")
    .word16Ule("artnet_universe")
    .word16Ule("artnet_channel")
    .word16Ule("my_port");
}

export default PusherBroadcast;

export function macString(broadcast: Struct): string {
  const mac = [];
  for (let i = 0; i < 6; i++) {
    mac.push(broadcast.mac[i].toString(16));
  }
  return mac.join(":");
}

export function ipString(broadcast: Struct): string {
  const ip = [];
  for (let i = 0; i < 4; i++) {
    ip.push(broadcast.ip[i].toString());
  }
  return ip.join(".");
}
