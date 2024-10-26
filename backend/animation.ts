import { Atem } from "atem-connection";
import { Layout } from "./types.ts";
import { SuperSourceBox } from "atem-connection/dist/state/video/superSource.js";
  
function animate(atem: Atem, start: Layout, end: Layout, frameCount: number, frames: number, delay: number) {
    // Return once we've reached the frame count
    if(frameCount >= frames) {
        console.log("Animation Complete!")
        return;
    }

    // Update
    for(let i = 0; i < start.superSource.boxes.length; i++) {
        const startX = start.superSource.boxes[i]?.x as number;
        const endX = end.superSource.boxes[i]?.x as number;
        const startY = start.superSource.boxes[i]?.y as number;
        const endY = end.superSource.boxes[i]?.y as number;
        const startSize = start.superSource.boxes[i]?.size as number;
        const endSize = end.superSource.boxes[i]?.size as number;
        const startCropTop = start.superSource.boxes[i]?.cropTop as number;
        const endCropTop = end.superSource.boxes[i]?.cropTop as number;
        const startCropBottom = start.superSource.boxes[i]?.cropBottom as number;
        const endCropBottom = end.superSource.boxes[i]?.cropBottom as number;
        const startCropLeft = start.superSource.boxes[i]?.cropLeft as number;
        const endCropLeft = end.superSource.boxes[i]?.cropLeft as number;
        const startCropRight = start.superSource.boxes[i]?.cropRight as number;
        const endCropRight = end.superSource.boxes[i]?.cropRight as number;

        const newBox: Partial<SuperSourceBox> = {
            x: startX + (frameCount / frames) * (endX - startX),
            y: startY + (frameCount / frames) * (endY - startY),
            size: startSize + (frameCount / frames) * (endSize - startSize),
            cropTop: startCropTop + (frameCount / frames) * (endCropTop - startCropTop),
            cropBottom: startCropBottom + (frameCount / frames) * (endCropBottom - startCropBottom),
            cropLeft: startCropLeft + (frameCount / frames) * (endCropLeft - startCropLeft),
            cropRight: startCropRight + (frameCount / frames) * (endCropRight - startCropRight),
        }
        atem.setSuperSourceBoxSettings(newBox, i, 1);
    }
    

    // call the next frame of the animation
    setTimeout(() => animate(atem, start, end, frameCount + 1, frames, delay), delay);
}

export function animateBetweenLayouts(atem: Atem, start: Layout, end: Layout, frameRate: number, duration: number) {
    const frames = (duration / 1000) * frameRate;
    const delay = 1000 / frameRate;

    animate(atem, start, end, 0, frames, delay);
}