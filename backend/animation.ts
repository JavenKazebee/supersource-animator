import { Atem } from "atem-connection";
import { Layout } from "./types.ts";
import { SuperSourceBox } from "atem-connection/dist/state/video/superSource.js";
  
function animate(atem: Atem, start: Layout, end: Layout, frameCount: number, frames: number, delay: number, superSource: number) {
    // Return once we've reached the frame count
    if(frameCount >= frames) {
        console.log("Animation Complete!")
        for(let i = 0; i < end.superSource.boxes.length; i++) {
            atem.setSuperSourceBoxSettings(end.superSource.boxes[i] as SuperSourceBox, i, superSource);
        }

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
    setTimeout(() => animate(atem, start, end, frameCount + 1, frames, delay, superSource), delay);
}

export function animateBetweenLayouts(atem: Atem, start: Layout, end: Layout, frameRate: number, duration: number, superSource: number) {
    const frames = (duration / 1000) * frameRate;
    const delay = 1000 / frameRate;

    // How far to get frame off screen
    const offScreenX = 3500;
    const offScreenY = 2000;

    for(let i = 0; i < start.superSource.boxes.length; i++) {

        // Box goes from enabled -> disabled
        if(start.superSource.boxes[i]?.enabled && !end.superSource.boxes[i]?.enabled) {
            // Find closest edge
            const top = offScreenY - (start.superSource.boxes[i]?.y as number);
            const bottom = offScreenY + (start.superSource.boxes[i]?.y as number);
            const left = offScreenX + (start.superSource.boxes[i]?.x as number);
            const right = offScreenX - (start.superSource.boxes[i]?.x as number);

            // Set box to animate to off screen in closest direction
            switch(Math.min(top, bottom, left, right)) {
                case left:
                    end.superSource.boxes[i]!.x = -offScreenX;
                    break;
                case right:
                    end.superSource.boxes[i]!.x = offScreenX;
                    break;
                case top:
                    end.superSource.boxes[i]!.y = offScreenY;
                    break;
                case bottom:
                    end.superSource.boxes[i]!.y = -offScreenY;
                    break;
            }

            // Clear any size and crop changes
            end.superSource.boxes[i]!.size = start.superSource.boxes[i]!.size;
            end.superSource.boxes[i]!.cropTop = start.superSource.boxes[i]!.cropTop;
            end.superSource.boxes[i]!.cropBottom = start.superSource.boxes[i]!.cropBottom;
            end.superSource.boxes[i]!.cropLeft = start.superSource.boxes[i]!.cropLeft;
            end.superSource.boxes[i]!.cropRight = start.superSource.boxes[i]!.cropRight;
        } 
        // Box goes from disabled -> enabled
        else if(!start.superSource.boxes[i]?.enabled && end.superSource.boxes[i]?.enabled) {
            // Find closest edge
            const top = offScreenY - (end.superSource.boxes[i]?.y as number);
            const bottom = offScreenY + (end.superSource.boxes[i]?.y as number);
            const left = offScreenX + (end.superSource.boxes[i]?.x as number);
            const right = offScreenX - (end.superSource.boxes[i]?.x as number);

            // Set box to animate into screen from closest edge direction
            switch(Math.min(top, bottom, left, right)) {
                case left:
                    start.superSource.boxes[i]!.x = -offScreenX;
                    break;
                case right:
                    start.superSource.boxes[i]!.x = offScreenX;
                    break;
                case top:
                    start.superSource.boxes[i]!.y = offScreenY;
                    break;
                case bottom:
                    start.superSource.boxes[i]!.y = -offScreenY;
                    break;
            }

            // Enable box and crop if needed at the start so we can actually see the animation
            start.superSource.boxes[i]!.enabled = true;
            start.superSource.boxes[i]!.cropped = end.superSource.boxes[i]!.cropped

            // Set starting box to the same size and crop as it should end
            start.superSource.boxes[i]!.size = end.superSource.boxes[i]!.size;
            start.superSource.boxes[i]!.cropTop = end.superSource.boxes[i]!.cropTop;
            start.superSource.boxes[i]!.cropBottom = end.superSource.boxes[i]!.cropBottom;
            start.superSource.boxes[i]!.cropLeft = end.superSource.boxes[i]!.cropLeft;
            start.superSource.boxes[i]!.cropRight = end.superSource.boxes[i]!.cropRight;
        }
    }


    animate(atem, start, end, 0, frames, delay, superSource);
}