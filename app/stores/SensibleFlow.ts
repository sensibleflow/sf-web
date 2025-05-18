import { defineStore } from 'pinia'

export const useSensibleFlowStore = defineStore('sensibleFlowStore', {
    state: () => ({
        sfon: [] as string[],
        current_id: [] as any[],
        previous_id: [] as any[],
        current_insert_id: [] as any[],
    }),
})