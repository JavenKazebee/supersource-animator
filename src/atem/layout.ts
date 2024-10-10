export default class Layout {
  name: string;
  boxes: Box[] = [];

  constructor(name: string) {
    this.name = name;
  }
}

interface Box {
    enabled: boolean;
    x: number;
    y: number;
    size: number;
    crop: {
        enabled: boolean;
        top: number;
        bottom: number;
        left: number;
        right: number;
    }
}