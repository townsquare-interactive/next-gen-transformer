import { Request, Response } from 'express'
import { logZodDataParse } from '../../schema/utils-zod.js'
import { saveInputSchema } from '../../schema/input-zod.js'
import { convertUrlToApexId } from '../../utilities/utils.js'
import { transformLuna } from '../../translation-engines/luna.js'
import { saveToS3 } from '../../output/save-to-s3.js'
import { handleError } from '../../utilities/errors.js'

export const save = async (req: Request, res: Response) => {
    try {
        logZodDataParse(req.body, saveInputSchema, 'savedInput')

        try {
            const url = req.body.siteData.config.website.url
            const basePath = convertUrlToApexId(url)
            const data = await transformLuna(req)
            await saveToS3({ ...data })

            res.json('posting to s3 folder: ' + basePath)
        } catch (err) {
            console.error(err)
            res.status(500).json({ err: 'Something went wrong' })
        }
    } catch (err) {
        handleError(err, res)
    }
}
