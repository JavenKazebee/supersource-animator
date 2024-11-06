<script setup lang="ts">
import { ref } from 'vue';
import { sendMessage, layouts, atemConnected } from '../socket/socket';
import { SuperSourceBox } from 'atem-connection/dist/state/video/superSource';

const liveLayout = ref(-1);

// Dimensions of the image on the layout cards
const svgWidth = 192;
const svgHeight = 108;
const svgScale = svgWidth / 3200;
const rectColors = ["green", "deepskyblue", "yellow", "magenta"]

// Variables for the "add layout" popover
const pop = ref()
const supersource = ref("0")
const layoutName = ref("")

// Variables for the "atem ip" popover
const atemPop = ref();
const atemIPInput = ref("");

function createLayout() {
    if(atemConnected) {
        sendMessage("createLayout", {name: layoutName.value, superSource: parseInt(supersource.value)});
        layoutName.value = ""; // Clear input field
        pop.value.hide(); // Hide popup
    }
}

function togglePopover(event: Event) {
    pop.value.toggle(event);
    layoutName.value = ""; // Clear input field
}

function toggleAtemIPPopover(event: Event) {
    atemPop.value.toggle(event);
}

function setLayout(layout: number) {
    if(atemConnected) {
        sendMessage("animate", {superSource: 1, layout: layout});
        liveLayout.value = layout;
    }
}

function setAtemIP() {
    sendMessage("atemIP", {atemIP: atemIPInput.value});
}

function deleteLayout(layout: number) {
    sendMessage("deleteLayout", {layout: layout});
}

function transformBoxForSVG(box: SuperSourceBox, index: number) {
    const width = svgWidth * (box!.size / 1000);
    const height = svgHeight * (box!.size / 1000);
    const x = box!.x * svgScale + svgWidth / 2 - width / 2;
    const y = svgHeight / 2 - box!.y * svgScale - height / 2;
    const fill = rectColors[index];

    return {x, y, width, height, fill};
}
</script>

<template>
    <div class="flex flex-col ml-10 mt-10 gap-5">
        <div class="flex flex-row">
            <div class="text-3xl">SuperSource Layouts</div>
            <Button class="ml-auto mr-5" :label="atemConnected ? 'Connected' : 'Not Connected'" :severity="atemConnected ? 'success' : 'danger'" @click="toggleAtemIPPopover"/>
        </div>

        <div class="flex flex-wrap gap-8">
            <Card class="cards w-72 border-4" :class="(liveLayout === layout.id && atemConnected) ? 'border-red-500' : 'hover:border-green-500 card-border'" v-for="layout in layouts" @click="setLayout(layout.id)">
                <template #title>{{ layout.name }}</template>
                <template #content>
                    <svg :width="svgWidth" :height="svgHeight" xmlns="http://www.w3.org/2000/svg">
                        <rect 
                            v-for="(box, index) in layout.superSource.boxes.filter(box => box?.enabled)"
                            v-bind="transformBoxForSVG(box!, index)"
                        />
                    </svg>
                </template>
                <template #footer>
                    <div class="flex">
                        <Button class="ml-auto" icon="pi pi-trash" rounded text severity="danger" @click.stop="deleteLayout(layout.id)"/>
                    </div>
                </template>
            </Card>
        </div>
        
        <Button icon="pi pi-plus" rounded class="float" :pt="{root: 'big-button'}" @click="togglePopover"/>

        <Popover ref="pop">
            <div class="w-100 flex flex-col gap-4">
                <div class="flex justify-center gap-4">
                    <div class="flex gap-2">
                        <RadioButton v-model="supersource" value="0" inputId="ss1" name="ss"/>
                        <label for="ss1">SuperSource 1</label>
                    </div>
                    <div class="flex gap-2">
                        <RadioButton v-model="supersource" value="1" inputId="ss2" name="ss"/>
                        <label for="ss2">SuperSource 2</label>
                    </div>
                </div>
                <div class="flex justify-center">
                    <FloatLabel variant="in">
                        <InputText id="layoutName" type="text" v-model="layoutName" autofocus/>
                        <label for="layoutName">Layout Name</label>
                    </FloatLabel>
                </div>
                <div class="flex justify-center">
                    <Button label="Create" :disabled="!atemConnected" @click="createLayout"/>
                </div>
            </div>
        </Popover>

        <Popover ref="atemPop">
            <div class="flex flex-row gap-4">
                <FloatLabel variant="in">
                    <InputText id="atemIPInput" type="text" v-model="atemIPInput" autofocus/>
                    <label for="atemIPInput">Atem IP</label>
                </FloatLabel>
                <Button label="Connect" @click="setAtemIP"/>
            </div>
        </Popover>
    </div>
    
</template>

<style scoped>
.float {
    position: fixed;
    right: 2rem;
    bottom: 2rem;
}

.big-button {
    height: 4rem !important;
    width: 4rem;
}

.card-border {
    border-color: var(--p-content-background);
}
</style>