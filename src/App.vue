<script setup lang="ts">
import { ofetch } from 'ofetch'
//@ts-ignore
import { copyText } from 'vue3-clipboard/dist/vue3-clipboard.min.js'
import { ref } from 'vue'
import './index.css'


const { VITE_LINKED_IS_API_URL, VITE_LINKED_IS_API_KEY, VITE_PROXY_API_URL, VITE_PROXY_API_KEY } = import.meta.env


console.log(VITE_LINKED_IS_API_URL, 'VITE_LINKED_IS_API_URL')

interface QRCodeData {
    id: number
    name: string
    type: string
    qr_code: string
    qr_code_logo: string
    settings: {
        inner_eye_style: string
        outer_eye_style: string
        style: string
        foreground_type: string
        foreground_color: string
        background_color: string
        background_color_transparency: number
        custom_eyes_color: boolean
        qr_code_logo_size: number
        size: number
        margin: number
        ecc: string
        text: string
    }
    last_datetime: string | null
    datetime: string
}

const data = ref('')
const qr = ref<QRCodeData | null>(null)
const selected = ref('')

const notify = (msg: string) => {
    parent.postMessage({ pluginMessage: { type: 'notify', message: msg } }, '*')
}

const cancel = () => {
    parent.postMessage({ pluginMessage: { type: 'cancel' } }, '*')
}

const createQr = () => {
    parent.postMessage({ pluginMessage: { type: 'create-qr' } }, '*')
}

const addSvg = (svg: string, data: string) => {
    parent.postMessage({ pluginMessage: { type: 'add-svg', svg: svg, name: data } }, '*')
}

const copyUrl = () => {
    //@ts-ignore
    copyText(selected.value, undefined, (error, event) => {
        if (error) {
            notify('Can not copy')
        } else {
            notify('Copied')
        }
    })
}

onmessage = (event) => {
    const message = event.data.pluginMessage
    if (message.type === 'text') {
        data.value = message.data
        console.log(data.value, 'data')
        send(data.value)
    }
    if (message.type === 'selected') {
        selected.value = message.selected
    }
}

const send = async (data: string) => {
    const form = new FormData()
    form.append('type', 'text')
    form.append('name', 'qrkodeburasi')
    form.append('text', data)

    await ofetch(`${VITE_PROXY_API_URL}${VITE_LINKED_IS_API_URL}`, {
        method: 'POST',
        //@ts-ignore
        headers: {
            Authorization: `Bearer ${VITE_LINKED_IS_API_KEY}`,
            'x-cors-api-key': VITE_PROXY_API_KEY,
            'Content-Disposition': form
        },
        body: form
    })
        .then(async (res) => {
            console.log(res.data.id)
            await ofetch(`${VITE_PROXY_API_URL}${VITE_LINKED_IS_API_URL}${res.data.id}`, {
                headers: {
                    Authorization: `Bearer ${VITE_LINKED_IS_API_KEY}`,
                    'x-cors-api-key': VITE_PROXY_API_KEY
                },
                method: 'GET'
            })
                .then(async (res) => {
                    console.log(res.data)
                    qr.value = res.data
                    await ofetch.raw(`${VITE_PROXY_API_URL}${res.data.qr_code}`, {
                        headers: {
                            Authorization: `Bearer ${VITE_LINKED_IS_API_KEY}`,
                            'x-cors-api-key': VITE_PROXY_API_KEY
                        },
                        method: 'GET',
                        async onResponse({ request, response, options }) {
                            // Log response
                            console.log('[fetch response]', request, response.status, response.body)
                            const svg = await response._data.text()
                            addSvg(svg, 'text')
                        }
                    })
                })
                .catch((err) => {
                    console.log(err)
                })
        })
        .catch((err) => {
            console.log(err)
        })
}
</script>

<template>
    <div class="bg-dark text-white flex h-full flex-col">
        <div class="flex items-center gap-1 py-0 px-1 h-10 bg-dark w-full flex-row border-b-[#0000001A]">
            <div class="flex-shrink-0 w-8 h-8">L</div>
            <div class="label flex items-center gap-2 title text-white text-center font-['Inter'] text-[11px] font-semibold w-full">
                QR Code Generator
            </div>
            <button @click="cancel" class="flex flex-shrink-0 justify-center items-center px-3 w-8 h-8 rounded-[0.1875rem] text-white">X</button>
        </div>

        <div class="flex items-start gap-4 self-stretch py-0 px-4 h-8 bg-dark">
            <div class="flex items-center gap-1 self-stretch title text-white text-center font-['Inter'] text-[11px] font-semibold">Genereate</div>
            <div class="flex items-center gap-1 self-stretch title text-white/[.30] text-center font-['Inter'] text-[11px]">Settings</div>
            <div class="flex items-center gap-1 self-stretch title text-white/[.30] text-center font-['Inter'] text-[11px]">Custom</div>
        </div>

        <div class="flex w-[240px] px-4 flex-col" v-if="selected">
            <span class="flex items-center gap-1 self-stretch title text-white text-center font-['Inter'] text-[11px] font-semibold">Selected:</span>
            <p class="text-white break-words max-w-[240px] text-[11px]">{{ selected }}</p>
        </div>

        <div v-if="qr" class="flex items-center justify-center p-2">
            <p class="rounded-sm w-[240px] h-[240px] flex items-center justify-center">
                <img :src="qr.qr_code" alt="" />
            </p>
        </div>

        <div class="p-2 flex flex-row w-full space-x-2" v-if="qr">
            <button
                @click="copyUrl"
                class="flex flex-shrink-0 w-1/2 h-8 text-[#000000CC] bg-[#F0F0F0] rounded-[0.1875rem] justify-center items-center text-center font-['Inter'] text-[11px] font-semibold"
            >
                Copy Link
            </button>
            <button
                class="flex flex-shrink-0 w-1/2 h-8 text-[#000000CC] bg-[#F0F0F0] rounded-[0.1875rem] justify-center items-center text-center font-['Inter'] text-[11px] font-semibold"
            >
                Insert SVG
            </button>
        </div>

        <div class="p-2">
            <button @click="createQr" class="button flex w-full justify-center items-center gap-1 py-0 px-3 h-8 rounded-[0.1875rem] bg-[#18a0fb]">
                <div class="title text-white text-center font-['Inter'] text-[11px] font-semibold">Create QR Code</div>
            </button>
        </div>
        
    </div>
</template>
