<script setup lang="ts">
import { ref } from 'vue';
import Layout from '../atem/layout';
import { getSuperSource } from '../atem/atem';
import { SuperSource } from 'atem-connection/dist/state/video/superSource';

const layouts = ref([] as Layout[])

// Add layout popup
const pop = ref()
const supersource = ref("0")
const layoutName = ref("")

function createLayout() {
    const layout = new Layout(layoutName.value);

    // If we are able to fetch supersource values, set them for the layout
    let ss = getSuperSource(parseInt(supersource.value));
    if(ss != undefined) {
        layout.superSource = ss as SuperSource;
    }
    layouts.value.push();
    layoutName.value = ""; // Clear input field
    pop.value.hide(); // Hide popup
}

function togglePopover(event: Event) {
    pop.value.toggle(event);
    layoutName.value = ""; // Clear input field
}

</script>

<template>
    <div class="flex flex-col ml-10 mt-10 gap-5">
        <div class="text-3xl">SuperSource Layouts</div>

        <div class="flex flex-wrap gap-8">
            <Card class="cards w-72 h-72" v-for="layout in layouts">
                <template #title>{{ layout.name }}</template>
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
                    <Button label="Create" @click="createLayout"/>
                </div>
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
</style>