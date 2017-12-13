import * as ref from "ref";
import * as RefArray from "ref-array";
import * as RefStruct from "ref-struct";

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
const UINT8 = ref.types.uint8;
const UINT16 = ref.types.uint16;
const UINT32 = ref.types.uint32;
const INT8 = ref.types.int8;
const INT16 = ref.types.int16;
const INT32 = ref.types.int32;
const ARR_UINT8 = RefArray(UINT8);

export interface BroadcastStructType extends RefStruct {
  mac: number[];
  ip: number[];
  devicetype: number;
  protocol: number;
  vid: number;
  pid: number;
  hardware_rev: number;
  software_rev: number;
  link_speed: number;
  strips_attached: number;
  max_strips_per_packet: number;
  pixels_per_strip: number;
  update_period: number;
  powertotal: number;
  delta_sequence: number;
  controller_ordinal: number;
  group_ordinal: number;
  artnet_universe: number;
  artnet_channel: number;
  my_port: number;
  padding_1: number;
  strip_flags: number[];
  padding_2: number;
  pusher_flags: number;
  segments: number;
  power_domain: number;
  last_driven_ip: number[];
  last_driven_port: number;
}

export const BroadcastStruct = <BroadcastStructType>RefStruct({
  mac: ARR_UINT8(6),
  ip: ARR_UINT8(4),
  devicetype: UINT8,
  protocol: UINT8,
  vid: UINT16,
  pid: UINT16,
  hardware_rev: UINT16,
  software_rev: UINT16,
  link_speed: UINT32,
  strips_attached: UINT8,
  max_strips_per_packet: UINT8,
  pixels_per_strip: UINT16,
  update_period: UINT32,
  powertotal: UINT32,
  delta_sequence: UINT32,
  controller_ordinal: INT32,
  group_ordinal: INT32,
  artnet_universe: UINT16,
  artnet_channel: UINT16,
  my_port: UINT16,
  padding_1: UINT16,
  strip_flags: ARR_UINT8(8),
  padding_2: UINT16,
  pusher_flags: UINT32,
  segments: UINT32,
  power_domain: UINT32,
  last_driven_ip: ARR_UINT8(4),
  last_driven_port: UINT16
});

export const DeviceType = {
  ETHERDREAM: 0,
  LUMIABRIDGE: 1,
  PIXELPUSHER: 2
};

export default () => {
  return new BroadcastStruct();
};

export function macString(broadcast: BroadcastStructType): string {
  const mac = [];

  for (let i = 0; i < 6; i++) {
    const mac_element = broadcast.mac[i];
    mac.push(mac_element.toString(16));
  }
  return mac.join(":");
}

export function ipString(broadcast: BroadcastStructType): string {
  const ip = [];
  for (let i = 0; i < 4; i++) {
    ip.push(broadcast.ip[i].toString());
  }
  return ip.join(".");
}
