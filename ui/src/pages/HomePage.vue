<script setup lang="ts">
import { computed, ref, watch } from 'vue';
import { sendMessage, layouts, atemConnected, atemIP, layoutOrder, animationFPS, animationDuration } from '../socket/socket';
import { SuperSourceBox } from 'atem-connection/dist/state/video/superSource';
import { useConfirm } from 'primevue/useconfirm';
import { VueDraggable } from 'vue-draggable-plus';

const liveLayout = ref(-1);

// Delete confirmation dialog
const confirm = useConfirm();
const confirmDelete = (layout: number) => {
    confirm.require({
       message: 'Are you sure you want to delete this layout?',
       header: 'Delete Layout',
       icon: 'pi pi-exclamation-triangle',
       rejectProps: {
            label: 'Cancel',
            severity: 'secondary',
            outlined: true
        },
        acceptProps: {
            label: 'Delete',
            severity: 'danger'
        },
        accept: () => {
            deleteLayout(layout);
        },
        reject: () => {}
    });
}

// Variables for the supersource selector
const liveSuperSourceOptions = ref([
    {name: "SuperSource 1", value: 0},
    {name: "SuperSource 2", value: 1}
]);
const liveSuperSource = ref(liveSuperSourceOptions.value[0]);

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

function createLayout() {
    if(atemConnected) {
        sendMessage("createLayout", {name: layoutName.value, superSource: parseInt(supersource.value)});
        layoutName.value = ""; // Clear input field
        pop.value.hide(); // Hide popup
    }
}

// Toggle the "add layout" popover
function togglePopover(event: Event) {
    pop.value.toggle(event);
    layoutName.value = ""; // Clear input field
}

// Toggle the "atem ip" popover
function toggleAtemIPPopover(event: Event) {
    atemPop.value.toggle(event);
}

// Animate to the selected layout
function setLayout(layout: number) {
    if(atemConnected) {
        //sendMessage("animate", {superSource: liveSuperSource.value.value, layout: layout});
        sendMessage("animateFromSource", {superSource: liveSuperSource.value.value, layout: layout, mixEngine: 0});
        liveLayout.value = layout;
    }
}

// Set the atemIP
function setAtemIP() {
    sendMessage("atemIP", {atemIP: atemIP.value});
}

// Delete a layout
function deleteLayout(layout: number) {
    sendMessage("deleteLayout", {layout: layout});
}

// Convert a SuperSourceBox to SVG coordinates
function transformBoxForSVG(box: SuperSourceBox, index: number) {
    const width = svgWidth * (box!.size / 1000);
    const height = svgHeight * (box!.size / 1000);
    const x = box!.x * svgScale + svgWidth / 2 - width / 2;
    const y = svgHeight / 2 - box!.y * svgScale - height / 2;
    const fill = rectColors[index];

    return {x, y, width, height, fill};
}

// Convert label for a SuperSourceBox to SVG coordinates
function transformTextForSVG(box: SuperSourceBox) {
    const boxTransform = transformBoxForSVG(box, 0);
    const x = boxTransform.x + boxTransform.width / 2;
    const y = boxTransform.y + boxTransform.height / 2;

    return {x, y};
}

function setLayoutOrder() {
    sendMessage("setLayoutOrder", {layoutOrder: layoutOrder.value});
}

// Watch for changes to the animation settings and update the backend
watch(animationFPS, () => {
    sendMessage("animationFPS", {fps: animationFPS.value});
});

watch(animationDuration, () => {
    sendMessage("animationDuration", {duration: animationDuration.value});
});

const orderedLayouts = computed(() => {
    return layoutOrder.value
        .map(id => layouts.value
        .find(layout => layout.id === id))
        .filter(layout => layout !== undefined);
});
</script>

<template>
    <ConfirmDialog></ConfirmDialog>

    <div class="flex flex-col gap-5">

        <!-- Header row-->
        <div class="flex flex-row pt-5 pl-10 pb-5 bg-gray-700">
            <div class="text-3xl">SuperSource Layouts</div>
            <SelectButton class="ml-auto" v-model="liveSuperSource" :options="liveSuperSourceOptions" optionLabel="name" :allowEmpty="false"/>
            <Button class="ml-auto mr-5" :label="atemConnected ? 'Connected' : 'Not Connected'" :severity="atemConnected ? 'success' : 'danger'" @click="toggleAtemIPPopover"/>
        </div>

        <!-- Main row -->
        <div class="flex flex-row">
            <!-- Layout cards-->
            <div class="flex gap-8 ml-4">
                <ScrollPanel>
                    <VueDraggable class="flex flex-wrap gap-8" ref="div" v-model="layoutOrder" @end="setLayoutOrder()">
                        <Card class="cards w-72 h-72 border-4" :class="(liveLayout === layout.id && atemConnected) ? 'border-red-500' : 'hover:border-green-500 card-border'" v-for="layout in orderedLayouts" @click="setLayout(layout.id)">
                            <template #title>{{ layout.name }}</template>
                            <template #content>
                                <svg :width="svgWidth" :height="svgHeight" xmlns="http://www.w3.org/2000/svg">
                                    <g v-for="(box, index) in layout.superSource.boxes.filter(box => box?.enabled)">
                                        <rect v-bind="transformBoxForSVG(box!, index)"/>
                                        <text class="svgText" text-anchor="middle" dominant-baseline="middle" v-bind="transformTextForSVG(box!)" fill="black" >{{ index + 1 }}</text>
                                    </g>
                                </svg>
                            </template>
                            <template #footer>
                                <div class="flex">
                                    <Button class="ml-auto" icon="pi pi-trash" rounded text severity="danger" @click.stop="confirmDelete(layout.id)"/>
                                </div>
                            </template>
                        </Card>
                    </VueDraggable>
                </ScrollPanel>
            </div>

            <Divider layout="vertical" class="!ml-auto !mr-2"/>

            <!-- Right sidebar -->
            <div class="flex flex-col gap-4 mr-2 h-screen items-center">
                <div class="mt-4 font-bold">Animation Properties</div>
                <!-- Animation FPS -->
                <div class="flex flex-col items-center m-4 gap-2">
                    <div>FPS</div>
                    <InputNumber pt:pcInputText:root:size="3" v-model="animationFPS" :min="1" :max="120"/>
                    <Slider class="mt-2 w-40" v-model="animationFPS" :min="1" :max="120"/>
                </div>

                <!-- Animation duration -->
                <div class="flex flex-col items-center m-4 gap-2">
                    <div>Duration (ms)</div>
                    <InputNumber pt:pcInputText:root:size="6" v-model="animationDuration" :min="100":max="5000" :useGrouping="false"/>
                    <Slider class="mt-2 w-40" v-model="animationDuration" :min="100" :step="100" :max="5000"/>
                </div>
            </div>
        </div>

        
        
        <!-- Floating button -->
        <Button icon="pi pi-plus" rounded class="float z-10" :pt="{root: 'big-button'}" @click="togglePopover"/>

        <!-- Add layout popover -->
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

        <!-- Atem IP popover -->
        <Popover ref="atemPop">
            <div class="flex flex-row gap-4">
                <FloatLabel variant="in">
                    <InputText id="atemIPInput" type="text" v-model="atemIP" autofocus/>
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
    right: 15rem;
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