import { Atem } from "atem-connection";
import { SuperSourceBox, SuperSource } from "atem-connection/dist/state/video/superSource.js";
  
function animate(atem: Atem, start: SuperSource, end: SuperSource, frameCount: number, frames: number, delay: number, superSource: number) {
    // Return once we've reached the frame count
    if(frameCount >= frames) {
        console.log("Animation Complete!")
        for(let i = 0; i < end.boxes.length; i++) {
            atem.setSuperSourceBoxSettings(end.boxes[i] as SuperSourceBox, i, superSource);
        }

        return;
    }

    // Update boxes
    for(let i = 0; i < start.boxes.length; i++) {
        const startX = start.boxes[i]?.x as number;
        const endX = end.boxes[i]?.x as number;
        const startY = start.boxes[i]?.y as number;
        const endY = end.boxes[i]?.y as number;
        const startSize = start.boxes[i]?.size as number;
        const endSize = end.boxes[i]?.size as number;
        const startCropTop = start.boxes[i]?.cropTop as number;
        const endCropTop = end.boxes[i]?.cropTop as number;
        const startCropBottom = start.boxes[i]?.cropBottom as number;
        const endCropBottom = end.boxes[i]?.cropBottom as number;
        const startCropLeft = start.boxes[i]?.cropLeft as number;
        const endCropLeft = end.boxes[i]?.cropLeft as number;
        const startCropRight = start.boxes[i]?.cropRight as number;
        const endCropRight = end.boxes[i]?.cropRight as number;

        const newBox: Partial<SuperSourceBox> = {
            x: startX + (frameCount / frames) * (endX - startX),
            y: startY + (frameCount / frames) * (endY - startY),
            size: startSize + (frameCount / frames) * (endSize - startSize),
            cropTop: startCropTop + (frameCount / frames) * (endCropTop - startCropTop),
            cropBottom: startCropBottom + (frameCount / frames) * (endCropBottom - startCropBottom),
            cropLeft: startCropLeft + (frameCount / frames) * (endCropLeft - startCropLeft),
            cropRight: startCropRight + (frameCount / frames) * (endCropRight - startCropRight),
            enabled: start.boxes[i]?.enabled,
            cropped: start.boxes[i]?.cropped
        }
        atem.setSuperSourceBoxSettings(newBox, i, 1);
    }
    

    // call the next frame of the animation
    setTimeout(() => animate(atem, start, end, frameCount + 1, frames, delay, superSource), delay);
}

export function animateBetweenLayouts(atem: Atem, start: SuperSource, end: SuperSource, frameRate: number, duration: number, superSource: number) {
    const frames = (duration / 1000) * frameRate;
    const delay = 1000 / frameRate;

    // How far to get frame off screen
    const offScreenX = 3500;
    const offScreenY = 2000;

    for(let i = 0; i < start.boxes.length; i++) {

        // If box starts uncropped and gets cropped
        if(!start.boxes[i]?.cropped && end.boxes[i]?.cropped) {
            start.boxes[i]!.cropped = true;
            start.boxes[i]!.cropTop = 0;
            start.boxes[i]!.cropBottom = 0;
            start.boxes[i]!.cropLeft = 0;
            start.boxes[i]!.cropRight = 0;
        }


        // Box goes from enabled -> disabled
        if(start.boxes[i]?.enabled && !end.boxes[i]?.enabled) {
            // Find closest edge
            const top = offScreenY - (start.boxes[i]?.y as number);
            const bottom = offScreenY + (start.boxes[i]?.y as number);
            const left = offScreenX + (start.boxes[i]?.x as number);
            const right = offScreenX - (start.boxes[i]?.x as number);

            // Set box to animate to off screen in closest direction
            switch(Math.min(top, bottom, left, right)) {
                case left:
                    end.boxes[i]!.x = -offScreenX;
                    end.boxes[i]!.y = start.boxes[i]!.y;
                    break;
                case right:
                    end.boxes[i]!.x = offScreenX;
                    end.boxes[i]!.y = start.boxes[i]!.y;
                    break;
                case top:
                    end.boxes[i]!.y = offScreenY;
                    end.boxes[i]!.x = start.boxes[i]!.x;
                    break;
                case bottom:
                    end.boxes[i]!.y = -offScreenY;
                    end.boxes[i]!.x = start.boxes[i]!.x;
                    break;
            }

            // Clear any size and crop changes
            end.boxes[i]!.size = start.boxes[i]!.size;
            end.boxes[i]!.cropTop = start.boxes[i]!.cropTop;
            end.boxes[i]!.cropBottom = start.boxes[i]!.cropBottom;
            end.boxes[i]!.cropLeft = start.boxes[i]!.cropLeft;
            end.boxes[i]!.cropRight = start.boxes[i]!.cropRight;
        } 
        // Box goes from disabled -> enabled
        else if(!start.boxes[i]?.enabled && end.boxes[i]?.enabled) {
            // Find closest edge
            const top = offScreenY - (end.boxes[i]?.y as number);
            const bottom = offScreenY + (end.boxes[i]?.y as number);
            const left = offScreenX + (end.boxes[i]?.x as number);
            const right = offScreenX - (end.boxes[i]?.x as number);

            // Set box to animate into screen from closest edge direction
            switch(Math.min(top, bottom, left, right)) {
                case left:
                    start.boxes[i]!.x = -offScreenX;
                    start.boxes[i]!.y = end.boxes[i]!.y;
                    break;
                case right:
                    start.boxes[i]!.x = offScreenX;
                    start.boxes[i]!.y = end.boxes[i]!.y;
                    break;
                case top:
                    start.boxes[i]!.y = offScreenY;
                    start.boxes[i]!.x = end.boxes[i]!.x;
                    break;
                case bottom:
                    start.boxes[i]!.y = -offScreenY;
                    start.boxes[i]!.x = end.boxes[i]!.x;
                    break;
            }

            // Enable box and crop if needed at the start so we can actually see the animation
            start.boxes[i]!.enabled = true;
            start.boxes[i]!.cropped = end.boxes[i]!.cropped

            // Set starting box to the same size and crop as it should end
            start.boxes[i]!.size = end.boxes[i]!.size;
            start.boxes[i]!.cropTop = end.boxes[i]!.cropTop;
            start.boxes[i]!.cropBottom = end.boxes[i]!.cropBottom;
            start.boxes[i]!.cropLeft = end.boxes[i]!.cropLeft;
            start.boxes[i]!.cropRight = end.boxes[i]!.cropRight;
        }
    }


    animate(atem, start, end, 0, frames, delay, superSource);
}