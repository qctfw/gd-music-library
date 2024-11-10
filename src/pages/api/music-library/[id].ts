import type { APIContext, APIRoute } from 'astro'
import { Buffer } from 'node:buffer'

export const prerender = false

export const GET: APIRoute = async ({params, request}: APIContext) => {
    const version = Number(params.id)

    const versionFilenames = new Map([
        [127, '127-2d0f36af2ff8ed7b26ac99573f03e57ba3929c0c762ed6eff7cec10aafdd330d.txt'],
    ])

    const versionFilename = versionFilenames.get(version)

    const hostname = new URL(request.url).origin
    const response = await fetch(hostname + '/datas/music-library/' + versionFilename)

    const responseText = await response.text()
    const parsedData = responseText.replaceAll('-', '+').replaceAll('_', '/')

    const dataBuffer = Buffer.from(parsedData, 'base64')

    return new Response(dataBuffer)
}
