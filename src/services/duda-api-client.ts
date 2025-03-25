import { Duda } from '@dudadev/partner-api'

class DudaApiClient {
    private client: Duda | null = null

    private createClient(): Duda {
        const { DUDA_USERNAME, DUDA_PASSWORD, DUDA_USE_SANDBOX } = process.env

        if (!DUDA_USERNAME || !DUDA_PASSWORD) {
            throw new Error('Duda API credentials are missing. Please define DUDA_USERNAME and DUDA_PASSWORD in your .env file.')
        }

        return new Duda({
            user: DUDA_USERNAME,
            pass: DUDA_PASSWORD,
            env: DUDA_USE_SANDBOX ? Duda.Envs.sandbox : Duda.Envs.direct, // Decide on the environment: sandbox or direct
        })
    }

    getClient(): Duda {
        // Initialize the client if it hasn't been initialized yet
        if (!this.client) {
            this.client = this.createClient()
        }
        return this.client
    }
}

export const dudaApiClient = new DudaApiClient()
