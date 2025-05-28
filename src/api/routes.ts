import express from 'express'
import * as ScrapeController from './controllers/scrape-controller.js'
import * as LandingController from './controllers/landing-controller.js'
import * as CreateSiteController from './controllers/create-site-controller.js'
import * as CMSController from './controllers/cms-controller.js'
import * as DudaController from './controllers/duda-controller.js'

const router = express.Router()

//landing routes
router.post('/landing', LandingController.createLanding)
router.delete('/landing-domains/:domain', LandingController.removeLandingDomain)
router.delete('/apexIDs/:apexID', LandingController.removeApexID)
router.get('/check-domain-config', LandingController.checkDomainConfig)
router.get('/landing-request-data', LandingController.getLandingRequestData)

// Create-site routes
router.post('/create-site', CreateSiteController.createSite)
router.patch('/domain-publish', CreateSiteController.publishDomain)
router.patch('/remove-domain', CreateSiteController.removeDomain)
router.patch('/publish', CreateSiteController.publishSite)
router.patch('/unpublish', CreateSiteController.unpublishSite)
router.get('/get-templates', CreateSiteController.getTemplates)
router.patch('/update-domain', CreateSiteController.updateDomain)

//scrape routes
router.get('/page-list', ScrapeController.getPageList)
router.post('/scrape-pages', ScrapeController.scrapePages)
router.post('/scrape-site', ScrapeController.scrapeSite)
router.delete('/scrape-site/:url', ScrapeController.removeScrapedContent)
router.get('/scraped-data', ScrapeController.getScrapedData)
router.post('/move-s3-data-to-duda', ScrapeController.moveS3DataToDuda)
router.get('/scraped-info-doc', ScrapeController.getScrapeDoc)
//save from luna cms
router.post('/save', CMSController.save)

// Duda routes
router.post('/duda-create-page', DudaController.createPage)
router.post('/duda-create-location', DudaController.createLocation)
router.patch('/duda-toggle-business-schema', DudaController.changeBusinessSchemaStatus)
router.post('/duda-save-content', DudaController.saveContent)
export default router
