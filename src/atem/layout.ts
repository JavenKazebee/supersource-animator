import { SuperSource } from "atem-connection/dist/state/video/superSource";

export default class Layout {
  name: string;
  superSource: SuperSource;

  constructor(name: string) {
    this.name = name;

    // Create empty supersource
    this.superSource = {
      index: 0,
      boxes: [undefined, undefined, undefined, {
        enabled: false,
        size: 0,
        source: 0,
        x: 0,
        y: 0,
        cropTop: 0,
        cropBottom: 0,
        cropLeft: 0,
        cropRight: 0,
        cropped: false
      }]
    }
  }
}