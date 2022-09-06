'use strict'

module.exports = function (ngModule) {
    ngModule.config([
        '$stateProvider',
        function ($stateProvider) {
            // console.log("uiRouterProvider 4");

            // $stateProvider.state('admin', {
            //     url: '/admin',
            //     views: {
            //         '': {
            //             template: require('./admin.html'),
            //             controller: 'adminCtrl',
            //         }
            //     },
            //     resolve: {
            //         'resolved_websitesList': ['$http', 'env', function ($http, env) {
            // 			//TODO: might need to set it up depend on environment
            //         	let endpoint = '/laravel/api/v1/cms/websiteslist';

            // 			return $http({
            //                 method: 'GET',
            //                 url: endpoint
            //             })
            // 			.then(function (response) {
            // 				return response.data;
            // 			});
            //         }],
            //     }
            // });

            $stateProvider.state('ui', {
                //url: '/ui/:pageId',
                url: '/ui',
                views: {
                    '': {
                        template: require('./template.html'),
                        controller: 'TsiCmsCtrl',
                    },
                    'loader@ui': {
                        template: require('./loader.html'),
                    },
                    'fluid@ui': {
                        template: require('./fluid/template.html'),
                        controller: require('./fluid')(ngModule),
                    },
                    'data@ui': {
                        template: require('wrapper/data.html'),
                    },
                    'save@ui': {
                        template: require('wrapper/save.html'),
                    },
                },
            })
        },
    ])

    ngModule.controller('mainCtrl', [
        '$rootScope',
        '$scope',
        '$log',
        '$http',
        function ($rootScope, $scope, $log, $http) {
            // console.log("mainCtrl starts")
            //$rootScope.bodyID = 'design'
        },
    ])

    // ngModule.controller('adminCtrl', ['$rootScope', '$scope', '$log', "$http", 'resolved_websitesList', function($rootScope, $scope, $log, $http, resolved_websitesList) {
    //     $scope.websites_list = resolved_websitesList.payload;
    //     $scope.selectUrl = function() {
    //         console.log('adminCtrl.selectUrl', $scope.selectedUrl, $rootScope.selectedUrl);
    //         $rootScope.selectedUrl = $scope.selectedUrl;
    //     };
    // }]);

    ngModule.controller('TsiCmsCtrl', [
        '$rootScope',
        '$scope',
        '$log',
        '$http',
        '$timeout',
        'Upload',
        'env',
        'TsiAuthentication',
        '$state' /*, 'cms_website_request'*/,
        function ($rootScope, $scope, $log, $http, $timeout, Upload, env, TsiAuthentication, $state /*, websiteRequest*/) {
            // console.log("TsiCmsCtrl starts", env /*,websiteRequest, $rootScope.selectedUrl*/);

            // External alerts from AWS. Loading in setTimeout so UI is loaded first.
            setTimeout(function () {
                var script = document.createElement('script')
                script.src = 'https://production.townsquareinteractive.com/laravel/storage/tsiExternalModal.js'
                var head = document.getElementsByTagName('head')[0]
                head.appendChild(script)
            }, 1000)

            window.onbeforeunload = function (e) {
                if ($scope.isSome2Save) {
                    var dialogText = 'Are you sure you want to leave?\nChanges you made may not be saved.'
                    e.returnValue = dialogText
                    return dialogText
                }
            }

            $scope.data = {
                vars: {
                    activeTopTab: 'design',
                    tsi15_window: '500',
                    showSite: true,
                    loadSite: false,
                    view: 'desktop',
                    stepsToFinishScripts: 0,
                    pagesToDelete: {},
                    mediaToDelete: {},
                    postsToDelete: {},
                    categoriesToDelete: {},
                    is_new_render: false,
                    isMaintenanceModeOn: false,
                    upload: {
                        bkgfile: null,
                        bkgfiles: null,
                    },

                    tsiCmsVars: {
                        proto: '/tsi/admin/prototypes/cms/',
                        apiUrl: '/wp-admin/admin-ajax.php',
                        cmsUrl: '/tsi/admin/publisher/',
                        previewUrl: '',
                        apiUrlBase: '/wp-admin/admin-ajax.php',
                        cmsUrlBase: '/tsi/admin/publisher/',
                        themes: '/wp-content/themes/',
                        laravelApiPath: env.settings.laravelApiPath, // get from config
                    },

                    modified: {
                        modules: {
                            bkgrds: { lbl: 'Backgrounds', changed: 0, save: 0 },
                            colors: { lbl: 'Colors', changed: 0, save: 0 },
                            fonts: { lbl: 'Fonts', changed: 0, save: 0 },
                            themes: { lbl: 'Themes', changed: 0, save: 0 },
                            code: { lbl: 'Custom Code', changed: 0, save: 0 },
                            logos: { lbl: 'Logos', changed: 0, save: 0 },
                            favicon: { lbl: 'FavIcon', changed: 0, save: 0 },
                        },
                        pages: {},
                        deletePages: {},
                        deleteMedia: {},
                        navs: {},
                        contact: {},
                        social: {},
                        ga_options: {},
                        maintenanceData: {},
                        vcita: {},
                        vcitaBusiness: {},
                        frms: {},
                        seo: {},
                        composites: {},
                        redirects: {},
                        blogging: {},
                        tags: {},
                        posts: {},
                        deletePosts: {},
                        deleteCategories: {},
                        imgixBaseUrlData: {},
                    },
                },

                forms2: { byObjectId: {}, modifiedFormIds: [] },
            }

            $scope.backup = {}

            $rootScope.$watch('website_id_resolved', function (value) {
                if (value === true) {
                    // console.log('website_id_resolved ' + ($rootScope.website_id_resolved ? 'yes' : 'no')); //deferred.resolve(config);
                    $scope.data.vars.is_new_render = env.settings.is_new_render
                    if (typeof $rootScope.selectedUrl != 'undefined' && $rootScope.selectedUrl != '') {
                        $scope.data.vars.tsiCmsVars.apiUrl = $rootScope.selectedUrl + $scope.data.vars.tsiCmsVars.apiUrlBase
                        $scope.data.vars.tsiCmsVars.cmsUrl = $rootScope.selectedUrl + $scope.data.vars.tsiCmsVars.cmsUrlBase
                        $scope.data.vars.tsiCmsVars.previewUrl = 'http://' + $rootScope.selectedUrl
                    }
                    if (!env.settings.is_new_render || TsiAuthentication.current.cms.user) $scope.getUserAndData()
                }
            })

            $scope.getUserAndData = function () {
                var get_user_url = env.settings.is_new_render
                    ? env.settings.laravelApiUrl + 'check-user/' + env.settings.website_id
                    : $scope.data.vars.tsiCmsVars.apiUrl + '?action=WpTsiCmsApi&command=getUser'

                /*
						var headers = {};
						var ca = document.cookie.split(';');
						console.log(ca);
			*/
                $http({
                    method: 'GET',
                    url: get_user_url, //$scope.data.vars.tsiCmsVars.apiUrl + "?action=WpTsiCmsApi&command=getUser"
                }).then(
                    function (success) {
                        var response = success.data

                        if (response.ok) {
                            $scope.data.vars.user = response.payload
                            if (env.settings.is_new_render) {
                                $scope.data.vars.user.data.ID = TsiAuthentication.current.cms.user.id
                                $scope.data.vars.user.data.user_login = TsiAuthentication.current.cms.user.login
                                $scope.data.vars.user.data.user_nicename = TsiAuthentication.current.cms.user.full_name
                                $scope.data.vars.user.data.user_email = TsiAuthentication.current.cms.user.email
                                $scope.data.vars.user.data.display_name = TsiAuthentication.current.cms.user.full_name
                            }
                            $scope.getAllData()
                        } else {
                            alert('Oops! You are not logged in')
                            document.location.href = '/'
                        }
                    },
                    function (error) {
                        // console.log('User Error', error);
                        alert('User Error ' + error.statusText)
                        $scope.data.vars.user = {}
                        if (env.settings.is_new_render) {
                            $state.go('login')
                        }
                    }
                )
            }

            $scope.getAllData = function () {
                var get_cms_url = env.settings.is_new_render
                    ? env.settings.laravelApiUrl + 'fulldata/' + env.settings.website_id
                    : $scope.data.vars.tsiCmsVars.apiUrl + '?action=WpTsiCmsApi&command=getCms'
                $http({
                    method: 'GET',
                    url: get_cms_url,
                }).then(
                    function (success) {
                        if (success.data.payload) {
                            angular.forEach(success.data.payload, function (value, key) {
                                $scope.data[key] = angular.copy(value)
                            })

                            $scope.data.design.bkgrds.tab = 'main'
                            if (typeof $scope.data.design.code != 'undefined' && $scope.data.design.code) {
                                $scope.data.design.code.tab = 'css'
                                $scope.data.design.code.visible = 0
                            } else {
                                $scope.data.design.code = { tab: 'css', visible: 0 }
                            }

                            try {
                                $scope.makeBackup($scope.data)

                                $scope.data.vars.tsiCmsVars.theme = $scope.data.design.themes.selected
                                $scope.data.vars.tsiCmsVars.themeUrl = $scope.data.vars.tsiCmsVars.themes + $scope.data.vars.tsiCmsVars.theme + '/'

                                if (typeof $rootScope.initLogosData != 'undefined') {
                                    $rootScope.initLogosData()
                                }

                                if (typeof $rootScope.setGlobalPubSettings != 'undefined') {
                                    $rootScope.setGlobalPubSettings()
                                }

                                $scope.data.vars.user.data.block_old_PP = $rootScope.block_old_PP()
                                $scope.data.vars.isMaintenanceModeOn = $scope.data.config.website.status == 3 ? true : false
                            } catch (err) {
                                console.log(err)
                            }

                            // Temp featured flag:
                            let params = new URL(document.location).searchParams
                            $rootScope.showNewMediaToolTab = params.get('nmt') == '1' ? true : false

                            // Ready to init controller data once all data is set up.
                            $rootScope.controller_ready_to_init = true

                            switch ($state.current.name) {
                                case 'ui.design':
                                    $rootScope.initDesignControllerScopeData()
                                    break
                                case 'ui.templates':
                                    $rootScope.initTemplatesControllerScopeData()
                                    break
                                case 'ui.logos':
                                    $rootScope.initLogosControllerScopeData()
                                    break
                                case 'ui.codeoverride':
                                    $rootScope.initCodeControllerScopeData()
                                    break
                                case 'ui.navigation':
                                    $rootScope.initNavigationControllerScopeData()
                                    break
                                case 'ui.publisher':
                                    $rootScope.initPublisherControllerScopeData()
                                    break
                                case 'ui.seo':
                                    $rootScope.initSeoControllerScopeData()
                                    break
                                case 'ui.media-react':
                                    $rootScope.initMediaReactControllerScopeData()
                                    break
                                case 'ui.media-tool':
                                    $rootScope.initMediaToolControllerScopeData()
                                    break
                                case 'ui.forms-react':
                                    $rootScope.initFormReactControllerScopeData()
                                    break
                                case 'ui.settings':
                                    $rootScope.initSettingsControllerScopeData()
                                    break
                                case 'ui.blogging':
                                    $rootScope.initBloggingControllerScopeData()
                                    break
                                default:
                                    break
                            }

                            $rootScope.initFormsUIController() //For Forms React.
                        } else alert('Empty Data')
                    },
                    function (error) {
                        alert('Data Error' + error)
                    }
                )
            }

            $scope.makeBackup = function (data, force) {
                // IT MAKES THE OBJECT BACKUPS AFTER FIRST TIME READINGAND AFTER SAVING

                var force = typeof force == 'undefined' ? false : force

                //console.log("\nMaking Backups\n")
                ////console.log("\n"+JSON.stringify(data)+"\n")

                angular.forEach(['bkgrds', 'code', 'colors', 'fonts', 'themes'], function (key) {
                    if ((typeof data.design != 'undefined' && typeof data.design[key] != 'undefined') || typeof data[key] != 'undefined') {
                        //console.log("Making Backup of " + key)
                        $scope.backup[key] = angular.copy($scope.data.design[key])
                    }
                })

                // angular.forEach(["logos"], function(key) {
                // 	if (typeof data[key] != "undefined") {
                // 		//console.log("Making Backup of Logos")
                // 		$scope.backup[key] = angular.copy($scope.data[key]);
                // 	}
                // });

                // Set logos as Not Chenged
                // $rootScope.backupLogos()
                // $rootScope.backupFavicon()
                $scope.backup['logos'] = 0
                $scope.backup['favicon'] = angular.copy($scope.data.config.website.favicon)

                // Pages Backup
                $rootScope.makeBackupPages(data['pages'], force)

                // Global SEO Backup
                if (typeof data['seo'] != 'undefined') {
                    //console.log("Making Global SEO Backup");
                    $scope.backup.seo = angular.copy($scope.data.seo)
                }

                //set forms backups
                if (typeof $rootScope.setFormBackups != 'undefined' && typeof data['forms'] != 'undefined') {
                    $rootScope.setFormBackups(data['forms'])
                }

                // Blog posts backup
                if (typeof data['blogging'] != 'undefined') {
                    //console.log("Making blog categories Backup");
                    $scope.backup.blogging = angular.copy($scope.data.blogging)
                }

                if (typeof data['posts'] != 'undefined') {
                    //console.log("Making blog posts Backup");
                    $scope.backup.posts = angular.copy($scope.data.posts)
                }
            }

            $rootScope.makeBackupPages = function (pages, force) {
                angular.forEach(pages, function (page_data, page_id) {
                    if (force || typeof $scope.data.pages[page_id].backup == 'undefined') {
                        //console.log("Making SEO & Attr Backup of page " + page_id)
                        $scope.data.pages[page_id].backup = {}
                        $scope.data.pages[page_id].backup.seo = angular.copy($scope.data.pages[page_id].seo)
                        $scope.data.pages[page_id].backup.attrs = {
                            title: angular.copy($scope.data.pages[page_id].title),
                            slug: angular.copy($scope.data.pages[page_id].slug),
                            parent: angular.copy($scope.data.pages[page_id].parent),
                            password: angular.copy($scope.data.pages[page_id].password),
                        }
                    }
                    if (typeof $scope.data.pages[page_id].publisher != 'undefined') {
                        //console.log("Making Data Backup of page " + page_id)
                        $scope.data.pages[page_id].backup.data = angular.copy($scope.data.pages[page_id].publisher.data)
                        $scope.data.pages[page_id].preview = angular.copy($scope.data.pages[page_id].publisher.data)
                    }
                })
            }

            $scope.$watch('data.vars.upload.bkgfile', function () {
                if ($scope.data.vars.upload.bkgfile != null) {
                    $scope.data.vars.upload.bkgfiles = [$scope.data.vars.upload.bkgfile]
                }
            })

            $rootScope.uploadBkg = function (files) {
                //console.log(" uploadBkg ")
                if (files && files.length) {
                    for (var i = 0; i < files.length; i++) {
                        var file = files[i]
                        if (!file.$error) {
                            var url_to_data = env.settings.is_new_render
                                ? env.settings.laravelApiUrl + 'uploadbackground/' + env.settings.website_id
                                : $scope.data.vars.tsiCmsVars.apiUrl + '?action=WpTsiCmsDesignBkgrdsApi&command=uploadBkgrds'

                            Upload.upload({
                                url: url_to_data, //$scope.data.vars.tsiCmsVars.apiUrl + '?action=WpTsiCmsDesignBkgrdsApi&command=uploadBkgrds',
                                method: 'POST',
                                file: file,
                            }).then(
                                function (resp) {
                                    $timeout(function () {
                                        var imgObj = resp.data.payload,
                                            attach_id = imgObj.id,
                                            src = imgObj.src

                                        if (attach_id && src) {
                                            if (!$scope.data.design.bkgrds.list) {
                                                $scope.data.design.bkgrds.list = {}
                                            }
                                            $scope.data.design.bkgrds.list[attach_id] = src
                                            $scope.setBackground(src, false)

                                            $scope.data.images.uploaded.unshift(imgObj)
                                        }
                                    })
                                },
                                null,
                                function (evt) {
                                    ////console.log(JSON.stringify(evt));
                                }
                            )
                        } else {
                            alert('error')
                        }
                    }
                }
            }

            $rootScope.setFavicon = function (src, isClick) {
                // console.log("setFavicon: " + src);
                // var isClick = isClick || true,
                // 	section = $scope.data.design.bkgrds.tab;
                $scope.data.config.website.favicon.src = src
                // $scope.updateIframeBkgrd(section);
                // if (isClick) jQuery("a[data-target='#"+section+"-bkg']").click();
            }

            $rootScope.uploadFavicon = function (files) {
                // console.log(" uploadFavicon ")
                if (files && files.length) {
                    for (var i = 0; i < files.length; i++) {
                        var file = files[i]
                        if (!file.$error) {
                            var url_to_data = env.settings.is_new_render
                                ? env.settings.laravelApiUrl + 'uploadfavicon/' + env.settings.website_id
                                : $scope.data.vars.tsiCmsVars.apiUrl + '?action=WpTsiCmsLogoApi&command=uploadFavicon'

                            Upload.upload({
                                url: url_to_data,
                                method: 'POST',
                                file: file,
                            }).then(
                                function (resp) {
                                    $timeout(function () {
                                        // console.log("resp", resp);
                                        var imgObj = resp.data.payload
                                        if (typeof imgObj.attachment != 'undefined') {
                                            var attach_id = imgObj.attachment.ID
                                            var src = imgObj.guid
                                        } else {
                                            var attach_id = imgObj.id
                                            var src = imgObj.src
                                        }

                                        if (attach_id && src) {
                                            if (typeof $scope.data.config.website.favicon.list == 'undefined') {
                                                $scope.data.config.website.favicon.list = {}
                                            }
                                            $scope.data.config.website.favicon.list[attach_id] = src
                                            $scope.setFavicon(src)
                                            //   $rootScope.updateIframeFavicon();

                                            $scope.data.images.uploaded.unshift(imgObj)
                                        }
                                    })
                                },
                                null,
                                function (evt) {
                                    //$scope.data.vars.log += "\n" + JSON.stringify(evt)
                                    //var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                                    //$scope.data.vars.log = 'progress: ' + progressPercentage + '% ' + evt.config.data.file.name + '\n' + $scope.data.vars.log;
                                }
                            )
                        } else {
                            alert('error')
                        }
                    }
                }
            }

            $rootScope.setActiveTopTab = function (activeTopTab) {
                $scope.data.vars.activeTopTab = activeTopTab
                $rootScope.bodyID = activeTopTab

                if (activeTopTab == 'design' || activeTopTab == 'logos') {
                    $scope.data.vars.tsi15_window = '500'
                    $scope.data.vars.showSite = true
                } else {
                    $scope.data.vars.tsi15_window = 'full'
                    $scope.data.vars.showSite = false

                    if (activeTopTab == 'publisher') {
                        $rootScope.bodyID = 'page-editor'
                        if (typeof $rootScope.getPage != 'undefined') {
                            $rootScope.getPage()
                        } else {
                            //console.log("$rootScope.getPage undefined");
                        }
                    }
                }

                if (activeTopTab == 'codeoverride') {
                    $scope.data.design.code.tab = 'css'
                }

                if (activeTopTab == 'navigation') {
                    $rootScope.bodyID = 'navigation-editor'
                }
            }

            $scope.fontsEditor = {
                'Abril Fatface': {
                    lbl: 'Abril Fatface',
                    google: 'Abril+Fatface',
                },
                'Alegreya Sans': {
                    lbl: 'Alegreya Sans',
                    google: 'Alegreya+Sans:400,700,400italic,700italic',
                },
                'Alegreya SC': {
                    lbl: 'Alegreya Sans SC',
                    google: 'Alegreya+SC:400,700,400italic,700italic',
                },
                Arial: {
                    lbl: 'Arial',
                    google: '',
                },
                Artifika: {
                    lbl: 'Artifika',
                    google: 'Artifika',
                },
                Arvo: {
                    lbl: 'Arvo',
                    google: 'Arvo:400,700,400italic,700italic',
                },
                'Autour One': {
                    lbl: 'Autour One',
                    google: 'Autour+One',
                },
                Barlow: {
                    lbl: 'Barlow',
                    google: 'Barlow:400,700,400italic,700italic',
                },
                'Barlow Condensed': {
                    lbl: 'Barlow Condensed',
                    google: 'Barlow+Condensed:400,700,400italic,700italic',
                },
                Benchnine: {
                    lbl: 'Benchnine',
                    google: 'BenchNine:400,700',
                },
                Bevan: {
                    lbl: 'Bevan',
                    google: 'Bevan',
                },
                'Bree Serif': {
                    lbl: 'Bree Serif',
                    google: 'Bree+Serif',
                },
                Cantarell: {
                    lbl: 'Cantarell',
                    google: 'Cantarell:400,400italic,700,700italic',
                },
                'Changa One': {
                    lbl: 'Changa One',
                    google: 'Changa+One',
                },
                Dosis: {
                    lbl: 'Dosis',
                    google: 'Dosis:400,700',
                },
                'Droid Sans': {
                    lbl: 'Droid Sans',
                    google: 'Droid+Sans:400,700,400italic,700italic',
                },
                'Droid Serif': {
                    lbl: 'Droid Serif',
                    google: 'Droid+Serif:400,700,400italic,700italic',
                },
                Eater: {
                    lbl: 'Eater',
                    google: 'Eater',
                },
                'Fredoka One': {
                    lbl: 'Fredoka One',
                    google: 'Fredoka+One',
                },
                Georgia: {
                    lbl: 'Georgia',
                    google: '',
                },
                'Germania One': {
                    lbl: 'Germania One',
                    google: 'Germania+One',
                },
                Gorditas: {
                    lbl: 'Gorditas',
                    google: 'Gorditas:700',
                },
                Poppins: {
                    lbl: 'Poppins',
                    google: 'Poppins:400,400italic,700,700italic',
                },
                'Sorts Mill Goudy': {
                    lbl: 'Sorts Mill Goudy',
                    google: 'Sorts+Mill+Goudy:400,400italic',
                },
                'Goudy Bookletter 1911': {
                    lbl: 'Goudy Bookletter 1911',
                    google: 'Goudy+Bookletter+1911',
                },
                'Great Vibes': {
                    lbl: 'Great Vibes',
                    google: 'Great+Vibes',
                },
                Helvetica: {
                    lbl: 'Helvetica',
                    google: '',
                },
                'Josefin Sans': {
                    lbl: 'Josefin Sans',
                    google: 'Josefin+Sans:400,700,400italic,700italic',
                },
                'Josefin Slab': {
                    lbl: 'Josefin Slab',
                    google: 'Josefin+Slab:400,700,400italic,700italic',
                },
                'Keania One': {
                    lbl: 'Keania One',
                    google: 'Keania+One',
                },
                Lato: {
                    lbl: 'Lato',
                    google: 'Lato:300,400,700,900,300italic,400italic,700italic,900italic',
                },
                Lora: {
                    lbl: 'Lora',
                    google: 'Lora:400,700,400italic,700italic',
                },
                'Lobster Two': {
                    lbl: 'Lobster',
                    google: 'Lobster+Two:400,700,400italic,700italic',
                },
                'Merriweather Sans': {
                    lbl: 'Merriweather Sans',
                    google: 'Merriweather+Sans:400,700,400italic,700italic',
                },
                Muli: {
                    lbl: 'Muli',
                    google: 'Muli:300,300italic,400,400italic',
                },
                'Open Sans': {
                    lbl: 'Open Sans',
                    google: 'Open+Sans:400,700,400italic,700italic',
                },
                Oswald: {
                    lbl: 'Oswald',
                    google: 'Oswald:400,700',
                },
                Overlock: {
                    lbl: 'Overlock',
                    google: 'Overlock:400,700,400italic,700italic',
                },
                Pacifico: {
                    lbl: 'Pacifico',
                    google: 'Pacifico',
                },
                Parisienne: {
                    lbl: 'Parisienne',
                    google: 'Parisienne',
                },
                'Playfair Display': {
                    lbl: 'Playfair',
                    google: 'Playfair+Display:400,700,400italic,700italic',
                },
                'Poiret One': {
                    lbl: 'Poiret One',
                    google: 'Poiret+One:400,700,400italic,700italic',
                },
                Prociono: {
                    lbl: 'Prociono',
                    google: 'Prociono',
                },
                'PT Sans Narrow': {
                    lbl: 'PT Sans Narrow',
                    google: 'PT+Sans+Narrow:400,700,400italic,700italic',
                },
                Quicksand: {
                    lbl: 'Quicksand',
                    google: 'Quicksand:700',
                },
                Quattrocento: {
                    lbl: 'Quattrocento',
                    google: 'Quattrocento:400,700',
                },
                'Racing Sans One': {
                    lbl: 'Racing Sans One',
                    google: 'Racing+Sans+One',
                },
                Raleway: {
                    lbl: 'Raleway',
                    google: 'Raleway:400,700',
                },
                Roboto: {
                    lbl: 'Roboto',
                    google: 'Roboto:400,700,400italic,700italic',
                },
                Rokkitt: {
                    lbl: 'Rokkitt',
                    google: 'Rokkitt:400,700',
                },
                Satisfy: {
                    lbl: 'Satisfy',
                    google: 'Satisfy',
                },
                Signika: {
                    lbl: 'Signika',
                    google: 'Signika:400,700',
                },
                'Times New Roman': {
                    lbl: 'Times New Roman',
                    google: '',
                },
                Ubuntu: {
                    lbl: 'Ubuntu',
                    google: 'Ubuntu:400,700,400italic,700italic',
                },
                Verdana: {
                    lbl: 'Verdana',
                    google: '',
                },
                'Work Sans': {
                    lbl: 'Work Sans',
                    google: 'Work+Sans:400,700,400italic,700italic',
                },
                Yellowtail: {
                    lbl: 'Yellowtail',
                    google: 'Yellowtail',
                },
            }

            $scope.getFontsEditor = function () {
                // "Abril Fatface/Abril Fatface;Alegreya Sans SC/Alegreya SC;Arial/Arial;Artifika/Artifika;Arvo/Arvo;Autour One/Autour One;Benchnine/Benchnine;Bevan/Bevan;Bree Serif/Bree Serif;Cantarell/Cantarell;Changa One/Changa One;Dosis/Dosis;Droid Sans/Droid Sans;Droid Serif/Droid Serif;Eater/Eater;Fredoka One/Fredoka One;Georgia/Georgia;Germania One/Germania One;Gorditas/Gorditas;Goudy Bookletter 1911/Sorts Mill Goudy;Great+Vibes/Great Vibes;Helvetica/Helvetica;Josefin Slab/Josefin Slab;Keania One/Keania One;Lato/Lato;Lora/Lora;Lobster/Lobster Two;Merriweather Sans/Merriweather Sans;Muli/Muli;Open Sans/Open Sans;Oswald/Oswald;Overlock/Overlock;Pacifico/Pacifico;Parisienne/Parisienne;Playfair/Playfair Display;Poiret One/Poiret One;Prociono/Prociono;PT Sans Narrow/PT Sans Narrow;Quicksand/Quicksand;Quattrocento/Quattrocento;Racing Sans One/Racing Sans One;Raleway/Raleway;Roboto/Roboto;Rokkitt/Rokkitt;Satisfy/Satisfy;Signika/Signika;Times New Roman/Times New Roman;Ubuntu/Ubuntu;Verdana/Verdana;Yellowtail/Yellowtail",
                var font_names = []
                angular.forEach($scope.fontsEditor, function (font, key) {
                    font_names.push(font.lbl + '/' + key)
                })
                return font_names.join(';')
            }

            $scope.getCSSEditor = function () {
                // ['http://fonts.googleapis.com/css?family=Abril+Fatface|Alegreya+SC:400,700,400italic,700italic|Artifika|Arvo:400,700,400italic,700italic|Autour+One|BenchNine:400,700|Bevan|Bree+Serif|Cantarell:400,400italic,700,700italic|Changa+One|Dosis:400,700|Droid+Sans:400,700,400italic,700italic|Droid+Serif:400,700,400italic,700italic|Eater|Fredoka+One|Germania+One|Gorditas:700|Sorts+Mill+Goudy:400,400italic|Great+Vibes|Josefin+Slab:400,700,400italic,700italic|Keania+One|Lato:300,400,700,900,300italic,400italic,700italic,900italic|Lora:400,700,400italic,700italic|Lobster+Two:400,700,400italic,700italic|Merriweather+Sans:400,700,400italic,700italic|Muli:300,300italic,400,400italic|Open+Sans:400,700,400italic,700italic|Oswald:400,700|Overlock:400,700,400italic,700italic|Pacifico|Parisienne|Playfair+Display:400,700,400italic,700italic|Poiret+One:400,700,400italic,700italic|Prociono|PT+Sans+Narrow:400,700,400italic,700italic|Quicksand:700|Quattrocento:400,700|Racing+Sans+One|Raleway:400,700|Roboto:400,700,400italic,700italic|Rokkitt:400,700|Satisfy|Signika:400,700|Ubuntu:400,700,400italic,700italic|Yellowtail'],
                var contentsCss = []
                angular.forEach($scope.fontsEditor, function (font, key) {
                    if (font.google != '') {
                        contentsCss.push(font.google)
                    }
                })
                var retval = '//fonts.googleapis.com/css?family=' + contentsCss.join('|') + '&display=swap'
                return [retval]
            }

            $rootScope.optionsCKEditor = {
                toolbar: [
                    // { name: 'document', items: [ 'Templates' ] },
                    {
                        name: 'basicstyles',
                        items: ['Bold', 'Italic', 'Underline', 'Subscript', 'Superscript', '-', 'RemoveFormat'],
                    },
                    { name: 'styles', items: ['Font', 'FontSize'] },
                    {
                        name: 'paragraph',
                        items: ['JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock'],
                    },
                    { name: 'colors', items: ['TextColor', 'BGColor'] },
                    { name: 'document', items: ['Source'] },
                    { name: 'links', items: ['Link', 'Unlink' /*, 'Anchor'*/] },
                    { name: 'clipboard', items: ['Undo', 'Redo'] },
                ],
                font_names: $scope.getFontsEditor(),
                contentsCss: $scope.getCSSEditor(),
                allowedContent: true,
            }

            $scope.optionsCKEditorPP = {
                toolbar: [
                    // { name: 'document', items: [ 'Templates' ] },
                    {
                        name: 'basicstyles',
                        items: ['Bold', 'Italic', 'Underline', 'Subscript', 'Superscript', '-', 'RemoveFormat'],
                    },
                    //{ name: 'styles', items: [ 'Font', 'FontSize' ] },
                    //{ name: 'paragraph', items: [ 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock' ] },
                    //{ name: 'colors', items: [ 'TextColor', 'BGColor' ] },
                    { name: 'paragraph', items: ['NumberedList', 'BulletedList'] },
                    { name: 'document', items: ['Source'] },
                    { name: 'links', items: ['Link', 'Unlink' /*, 'Anchor'*/] },
                    { name: 'clipboard', items: ['Undo', 'Redo'] },
                ],
                allowedContent: true,
            }

            $scope.optionsCKEditorBlogging = {
                toolbar: [
                    // { name: 'document', items: [ 'Templates' ] },
                    {
                        name: 'basicstyles',
                        items: ['Bold', 'Italic', 'Underline', 'Subscript', 'Superscript', '-', 'RemoveFormat'],
                    },
                    //{ name: 'styles', items: [ 'Font', 'FontSize' ] },
                    //{ name: 'paragraph', items: [ 'JustifyLeft', 'JustifyCenter', 'JustifyRight', 'JustifyBlock' ] },
                    //{ name: 'colors', items: [ 'TextColor', 'BGColor' ] },
                    { name: 'paragraph', items: ['NumberedList', 'BulletedList'] },
                    { name: 'document', items: ['Source'] },
                    { name: 'links', items: ['Link', 'Unlink' /*, 'Anchor'*/] },
                    { name: 'clipboard', items: ['Undo', 'Redo'] },
                    { name: 'insert', items: ['Image'] },
                ],
                allowedContent: true,
            }

            $rootScope.optionsTinyMCE = {
                /*
            onChange: function(e) {
                // put logic here for keypress and cut/paste changes
            },
            */
                forced_root_block: '', // It removes the <p> around the text
                height: 240,
                menubar: false,
                toolbar_items_size: 'small',
                toolbar: [
                    'fontselect fontsizeselect | forecolor backcolor',
                    'bold italic superscript subscript | alignleft aligncenter alignright | link removeformat code',
                ],
                style_formats: [
                    { title: 'Bold', icon: 'bold', format: 'bold' },
                    { title: 'Italic', icon: 'italic', format: 'italic' },
                    { title: 'Underline', icon: 'underline', format: 'underline' },
                    {
                        title: 'Strikethrough',
                        icon: 'strikethrough',
                        format: 'strikethrough',
                    },
                    { title: 'Superscript', icon: 'superscript', format: 'superscript' },
                    { title: 'Subscript', icon: 'subscript', format: 'subscript' },
                ],
                plugins: 'textcolor colorpicker link code visualchars',
                fontsize_formats: '8pt 9pt 10pt 11pt 12pt 14pt 16pt 18pt 20pt 22pt 24pt 26pt 28pt 36pt 48pt 72pt',
                font_formats:
                    "Abril Fatface='Abril Fatface';Alegreya Sans='Alegreya Sans';Alegreya Sans SC='Alegreya SC';Arial=Arial;Artifika='Artifika';Arvo='Arvo';Autour One='Autour One';Barlow='Barlow';Barlow Condensed='Barlow Condensed';Benchnine='Benchnine';Bevan='Bevan';Bree Serif='Bree Serif';Cantarell='Cantarell';Changa One='Changa One';Dosis='Dosis';Droid Sans='Droid Sans';Droid Serif='Droid Serif';Eater='Eater';Fredoka One='Fredoka One';Georgia=Georgia;Germania One='Germania One';Gorditas='Gorditas';Sorts Mill Goudy='Sorts Mill Goudy';Goudy Bookletter 1911='Goudy Bookletter 1911';Great+Vibes='Great Vibes';Helvetica=Helvetica;Josefin Sans='Josefin Sans';Josefin Slab='Josefin Slab';Keania One='Keania One';Lato='Lato';Lora='Lora';Lobster='Lobster Two';Merriweather Sans='Merriweather Sans';Muli='Muli';Open Sans='Open Sans';Oswald='Oswald';Overlock='Overlock';Pacifico='Pacifico';Parisienne='Parisienne';Playfair='Playfair Display';Poiret One='Poiret One';Poppins='Poppins';Prociono='Prociono';PT Sans Narrow='PT Sans Narrow';Quicksand='Quicksand';Quattrocento='Quattrocento';Racing Sans One='Racing Sans One';Raleway='Raleway';Roboto='Roboto';Rokkitt='Rokkitt';Satisfy='Satisfy';Signika='Signika';Times New Roman=Times New Roman;Ubuntu='Ubuntu';Verdana=Verdana;Work Sans='Work Sans';Yellowtail='Yellowtail'",
                theme: 'modern',
                content_css: [
                    /* I'll make this dynamic. I have to rework some architectural stuff so this works */
                    '//fonts.googleapis.com/css?family=Abril+Fatface|Alegreya+Sans:400,700,400italic,700italic|Alegreya+SC:400,700,400italic,700italic|Artifika|Arvo:400,700,400italic,700italic|Autour+One|Barlow:400,700,400italic,700italic|Barlow+Condensed:400,700,400italic,700italic|BenchNine:400,700|Bevan|Bree+Serif|Cantarell:400,400italic,700,700italic|Changa+One|Dosis:400,700|Droid+Sans:400,700,400italic,700italic|Droid+Serif:400,700,400italic,700italic|Eater|Fredoka+One|Germania+One|Gorditas:700|Goudy+Bookletter+1911|Sorts+Mill+Goudy:400,400italic|Great+Vibes|Josefin+Sans:400,700,400italic,700italic|Josefin+Slab:400,700,400italic,700italic|Keania+One|Lato:300,400,700,900,300italic,400italic,700italic,900italic|Lora:400,700,400italic,700italic|Lobster+Two:400,700,400italic,700italic|Merriweather+Sans:400,700,400italic,700italic|Muli:300,300italic,400,400italic|Open+Sans:400,700,400italic,700italic|Oswald:400,700|Overlock:400,700,400italic,700italic|Pacifico|Parisienne|Playfair+Display:400,700,400italic,700italic|Poiret+One:400,700,400italic,700italic|Poppins:400,400italic,700,700italic|Prociono|PT+Sans+Narrow:400,700,400italic,700italic|Quicksand:700|Quattrocento:400,700|Racing+Sans+One|Raleway:400,700|Roboto:400,700,400italic,700italic|Rokkitt:400,700|Satisfy|Signika:400,700|Ubuntu:400,700,400italic,700italic|Work+Sans:400,700,400italic,700italic|Yellowtail&display=swap',
                ],
            }

            $rootScope.getFileName = function (url) {
                var filename = typeof url == 'undefined' ? '' : url.split(/(\\|\/)/g).pop()
                return filename.indexOf('HOLDER') > 0 || filename.indexOf('holder') > 0 ? '' : filename
            }

            $rootScope.getFileAttrs = function (item) {
                var Attrs = ''
                if (typeof item.image == 'undefined' && typeof item.src != 'undefined') {
                    item = {
                        image: item.src,
                        imageSize: {
                            width: item.width,
                            height: item.height,
                            size: item.size,
                        },
                    }
                }
                if (typeof item.image != 'undefined' && item.image != '' && item.image.indexOf('HOLDER') == -1) {
                    Attrs += item.image.split(/(\\|\/)/g).pop()
                    if (typeof item.imageSize != 'undefined' && typeof item.imageSize.size != 'undefined') {
                        Attrs += ' - ' + item.imageSize.width + 'x' + item.imageSize.height
                        Attrs += ', ' + item.imageSize.size + ''
                    }
                } else {
                    Attrs += 'No image data'
                }
                return Attrs
            }

            $scope.isDirty = function () {
                // do your logic and return 'true' to display the prompt, or 'false' otherwise.
                return true
            }

            $scope.loadWebSite = function (self) {
                var self = typeof self == 'undefined' ? true : self
                $scope.data.vars.loadSiteSelfWindow = self
                //var src = "/?isTsi15=ON&" + Date.now();
                var src = (env.settings.cmsBaseUrl ? env.settings.cmsBaseUrl : '') + '/?isTsi15=ON&' + Date.now()
                if (self) {
                    jQuery('#website').attr('src', src)
                } else {
                    var o = $('.tsi15-topbar').first(),
                        l = o.outerWidth(),
                        t = $('#tsi15-navigation').outerHeight(),
                        h = $(document).height(),
                        w = $(document).width() - l - 50
                    window.$windowScope = $scope
                    $scope.data.vars.website = window.open(
                        src,
                        'website',
                        'outerWidth=' + w + ',outerHeight=' + h + ',0,left=' + l + ',top=' + t + ',status=0,'
                    )
                }
                $scope.data.vars.loadSite = 1
            }

            $scope.unloadWebSite = function () {
                jQuery('#website').attr('src', 'about:blank')
                $scope.data.vars.loadSite = 0
            }

            $scope.setView = function (view) {
                // https://www.w3schools.com/jsref/prop_frame_contentwindow.asp
                var bodyClass = '',
                    width = $('.tsi15-site-frame').first().width()

                if (view == 'mobile') {
                    bodyClass = 'isMobile'
                    width = 480
                } else if (view == 'tablet') {
                    bodyClass = 'isTablet'
                    width = 768
                }

                var iframe = jQuery('#website'),
                    website = iframe[0].contentWindow || iframe[0].contentDocument

                var body = jQuery('body', website.document)

                body.removeClass('isMobile isTablet')
                body.addClass(bodyClass)
                iframe.attr('width', width + 'px')

                if (typeof $scope.data.vars.website != 'undefined') {
                    body = jQuery('body', $scope.data.vars.website.document)

                    body.removeClass('isMobile isTablet')
                    body.addClass(bodyClass)
                    $scope.data.vars.website.resizeTo(width, $(document).height())
                }

                $scope.data.vars.view = view
            }

            $scope.$on('applyCmsStyles', function (e) {
                $rootScope.applyCmsStyles()
            })

            $rootScope.applyCmsStyles = function () {
                if (typeof $rootScope.updateIframeBkgrd == 'function') $rootScope.updateIframeBkgrd()
                if (typeof $rootScope.updateIframeColors == 'function') $rootScope.updateIframeColors()
                if (typeof $rootScope.updateIframeFonts == 'function') $rootScope.updateIframeFonts()
                if (typeof $rootScope.updateIframeLogos == 'function') $rootScope.updateIframeLogos()
                if (typeof $rootScope.updateIframeCustomCss == 'function') $rootScope.updateIframeCustomCss()
                //if (typeof($rootScope.updateIframeCustomJS)=="function") $rootScope.updateIframeCustomJS();
            }

            $scope.$on('findDblClickedItem', function (e) {
                $rootScope.findDblClickedItem()
            })

            $rootScope.findDblClickedItem = function () {
                var websites = $rootScope.getWebsiteWindows()

                angular.forEach(websites, function (website) {
                    if (typeof website != 'undefined' && typeof website.dblClickedItem != 'undefined') {
                        var info = website.dblClickedItem.split(',')
                        if (info.length == 4) {
                            $scope.data.vars.dblClickedItem = {
                                page: info[0],
                                col: info[1],
                                mod: info[2],
                                item: info[3],
                            }

                            if (typeof $scope.data.pages[$scope.data.vars.dblClickedItem.page] != 'undefined' && typeof $rootScope.getPage != 'undefined') {
                                $rootScope.setPageCurrents($scope.data.vars.dblClickedItem.mod)
                                if (
                                    typeof $scope.data.vars.curr_page_id != 'undefined' &&
                                    $scope.data.vars.curr_page_id != $scope.data.vars.dblClickedItem.page
                                ) {
                                    var page = $scope.data.pages[$scope.data.vars.dblClickedItem.page]
                                    $rootScope.getPage(page.id, page.url, false)
                                }
                            }
                        }
                    }
                })
            }

            $rootScope.tsi_v3 = function () {
                if (typeof $scope.data.design.themes != 'undefined') {
                    var theme = $scope.data.design.themes.selected
                    return theme == 'beacon-theme_charlotte' || theme == 'beacon-theme_ignite' || theme == 'beacon-theme_rhinebeck'
                } else {
                    return false
                }
            }

            $rootScope.pageModified = function (page_id) {
                var modified = false

                if (typeof $scope.data.pages[page_id].publisher == 'object') {
                    // if (
                    //   typeof $scope.data.vars.curr_page_id != 'undefined' &&
                    //   $scope.data.vars.curr_page_id == page_id
                    // ) {
                    //   if (typeof $scope.data.pages[page_id].backup.data != 'undefined') {
                    //     // console.log(angular.equals($scope.data.pages[page_id].publisher.data, $scope.data.pages[page_id].backup.data))
                    //   }
                    // }

                    if (
                        (typeof $scope.data.pages[page_id].backup.data != 'undefined' &&
                            !angular.equals($scope.data.pages[page_id].publisher.data, $scope.data.pages[page_id].backup.data)) ||
                        (typeof $scope.data.pages[page_id].backup.modified != 'undefined' && $scope.data.pages[page_id].backup.modified)
                    ) {
                        modified = true
                    }
                }

                return modified
            }

            $rootScope.pageSeoModified = function (page_id) {
                var modified = false

                if (!angular.equals($scope.data.pages[page_id].seo, $scope.data.pages[page_id].backup.seo)) {
                    modified = true
                }

                return modified
            }

            $rootScope.getPageAttrs = function (page) {
                var fields = ['title', 'slug', 'parent', 'password'],
                    attrs = {}

                angular.forEach(fields, function (field) {
                    attrs[field] = field == 'title' ? $rootScope.strDecode(page[field]) : page[field]
                    //attrs[field] = page[field];
                })

                return attrs
            }

            $rootScope.pageAttrModified = function (page_id) {
                var modified = false,
                    attrs = $rootScope.getPageAttrs($scope.data.pages[page_id])

                if (!angular.equals(attrs, $scope.data.pages[page_id].backup.attrs)) {
                    modified = true
                }

                return modified
            }

            $scope.getDataChanges = function () {
                // dalbert: Give listeners a chance to prepare data for this.
                $rootScope.$broadcast('cms.onGetDataChanges')

                // when hitting this save button, sync data from react to angular if the current module is react.
                const { getCurrentFrameworkType, syncScopeDataFromReduxStore, syncScopeDataToReduxStore } = require('~redux/utils/core/angular-redux-connect')
                if (getCurrentFrameworkType() === 'react') {
                    syncScopeDataFromReduxStore($scope.data)
                }

                // Design
                angular.forEach(['bkgrds', 'code', 'colors', 'fonts', 'themes'], function (key) {
                    $scope.data.vars.modified.modules[key].changed = angular.equals($scope.data.design[key], $scope.backup[key]) ? 0 : 1
                    $scope.data.vars.modified.modules[key].save = $scope.data.vars.modified.modules[key].changed
                })

                // $scope.data.vars.modified.modules["logos"].changed = angular.equals($scope.data.logos, $scope.backup.logos)?0:1;
                // $scope.data.vars.modified.modules["logos"].save = $scope.data.vars.modified.modules["logos"].changed;

                $scope.data.vars.modified.modules['logos'].changed = $scope.backup['logos']
                $scope.data.vars.modified.modules['logos'].save = $scope.backup['logos'] == 1

                $scope.data.vars.modified.modules['favicon'].changed = angular.equals($scope.data.config.website.favicon, $scope.backup['favicon']) ? 0 : 1
                $scope.data.vars.modified.modules['favicon'].save = $scope.data.vars.modified.modules['favicon'].changed

                // forcing to save design options in case of theme change in new render
                if ($scope.data.vars.modified.modules['themes'].changed && env.settings.is_new_render) {
                    angular.forEach(['bkgrds', 'colors', 'fonts'], function (key) {
                        $scope.data.vars.modified.modules[key].changed = 1
                        $scope.data.vars.modified.modules[key].save = 1
                    })
                }

                // Pages
                $scope.data.vars.modified.pages = {}
                var checkPagesModifiedObj = function (page_id) {
                    if (typeof $scope.data.vars.modified.pages[page_id] == 'undefined') {
                        $scope.data.vars.modified.pages[page_id] = {
                            changed: 1,
                            save: 1,
                            what: {
                                data: 0,
                                attrs: 0,
                                seo: 0,
                            },
                        }
                    }
                }

                angular.forEach($scope.data.pages, function (page_data, page_id) {
                    if (typeof $scope.data.vars.pagesToDelete[page_id] == 'undefined') {
                        if ($rootScope.pageModified(page_id)) {
                            checkPagesModifiedObj(page_id)
                            $scope.data.vars.modified.pages[page_id].what.data = 1
                        }

                        if ($rootScope.pageAttrModified(page_id)) {
                            checkPagesModifiedObj(page_id)
                            $scope.data.vars.modified.pages[page_id].what.attrs = 1
                        }

                        if ($rootScope.pageSeoModified(page_id)) {
                            checkPagesModifiedObj(page_id)
                            $scope.data.vars.modified.pages[page_id].what.seo = 1
                        }
                    }
                })

                ////console.log(JSON.stringify($scope.data.vars.modified.pages));

                $scope.data.vars.modified.deletePages = {
                    changed: Object.keys($scope.data.vars.pagesToDelete).length > 0 ? 1 : 0,
                    save: 1,
                }

                $scope.data.vars.modified.deleteMedia = {
                    changed: Object.keys($scope.data.vars.mediaToDelete).length > 0 ? 1 : 0,
                    save: 1,
                }

                // Posts
                $scope.data.vars.modified.deletePosts = {
                    changed: Object.keys($scope.data.vars.postsToDelete).length > 0 ? 1 : 0,
                    save: 1,
                }

                $scope.data.vars.modified.deleteCategories = {
                    changed: Object.keys($scope.data.vars.categoriesToDelete).length > 0 ? 1 : 0,
                    save: 1,
                }

                // Navigation
                $scope.data.vars.modified.navs = {
                    changed: typeof $rootScope.navigationHasUpdates != 'undefined' && $rootScope.navigationHasUpdates() ? 1 : 0,
                    save: 1,
                }

                // 301 Redirects
                $scope.data.vars.modified.redirects = {
                    changed: typeof $rootScope.redirectsHasUpdates != 'undefined' && $rootScope.redirectsHasUpdates() ? 1 : 0,
                    save: 1,
                }

                // Contact
                $scope.data.vars.modified.contact = {
                    changed: typeof $rootScope.contactHasUpdates != 'undefined' && $rootScope.contactHasUpdates() ? 1 : 0,
                    save: 1,
                }

                // Social
                $scope.data.vars.modified.social = {
                    changed: typeof $rootScope.socialHasUpdates != 'undefined' && $rootScope.socialHasUpdates() ? 1 : 0,
                    save: 1,
                }

                // Social
                $scope.data.vars.modified.ga_options = {
                    changed: typeof $rootScope.gaOptionsHasUpdates != 'undefined' && $rootScope.gaOptionsHasUpdates() ? 1 : 0,
                    save: 1,
                }

                // vcita
                $scope.data.vars.modified.vcita = {
                    changed: typeof $rootScope.vcitaHasUpdates != 'undefined' && $rootScope.vcitaHasUpdates() ? 1 : 0,
                    save: 1,
                }

                // vcita business
                $scope.data.vars.modified.vcitaBusiness = {
                    changed: typeof $rootScope.vcitaBusinessHasUpdates != 'undefined' && $rootScope.vcitaBusinessHasUpdates() ? 1 : 0,
                    save: 1,
                }

                // Imgix Base Url
                $scope.data.vars.modified.imgixBaseUrlData = {
                    changed: typeof $rootScope.imgixHasUpdate != 'undefined' && $rootScope.imgixHasUpdate() ? 1 : 0,
                    save: 1,
                }

                // Maintenance
                $scope.data.vars.modified.maintenanceData = {
                    changed: typeof $rootScope.maintenanceHasUpdates != 'undefined' && $rootScope.maintenanceHasUpdates() ? 1 : 0,
                    save: 1,
                }

                // SEO
                $scope.data.vars.modified.seo = {
                    changed: typeof $rootScope.seoHasUpdates != 'undefined' && $rootScope.seoHasUpdates() ? 1 : 0,
                    save: 1,
                }

                // Templates / Footer UI
                $scope.data.vars.modified.composites = {
                    changed: typeof $rootScope.templatesHasUpdates != 'undefined' && $rootScope.templatesHasUpdates() ? 1 : 0,
                    save: 1,
                }

                //Blog Posts - Categories

                $scope.data.vars.modified.blogging = {
                    changed: typeof $rootScope.blogCategoriesHasUpdates != 'undefined' && $rootScope.blogCategoriesHasUpdates() ? 1 : 0,
                    save: 1,
                }

                //Blog Posts - Tags

                $scope.data.vars.modified.tags = {
                    changed: typeof $rootScope.blogTagsHasUpdates != 'undefined' && $rootScope.blogTagsHasUpdates() ? 1 : 0,
                    save: 1,
                }

                $scope.data.vars.modified.posts = {
                    changed: typeof $rootScope.blogPostsHasUpdates != 'undefined' && $rootScope.blogPostsHasUpdates() ? 1 : 0,
                    save: 1,
                }

                // Forms
                if (typeof $rootScope.getModifiedForms != 'undefined') {
                    $scope.data.vars.modified.frms = $rootScope.getModifiedForms()
                    angular.forEach($scope.data.vars.modified.frms, function (frm_data, frm_id) {
                        frm_data.save = 1
                    })
                }

                // Sync Angularjs back to React:
                syncScopeDataToReduxStore($scope.data)
            }

            $rootScope.initPubCnf = function () {
                $rootScope.modules_types = $scope.data.config.publisher.modules
                $rootScope.section_layouts = $scope.data.config.publisher.layouts.setup
            }

            $rootScope.getPublisherCnf = function (theme_id) {
                $log.info('Get publisher configuration')

                var url_to_data = env.settings.is_new_render
                    ? env.settings.laravelApiUrl + 'publisherconfig/' + env.settings.website_id
                    : $scope.data.vars.tsiCmsVars.apiUrl + '?action=WpTsiCmsPublisherApi&command=getCnf&theme=' + theme_id

                $http({
                    method: 'GET',
                    url: url_to_data,
                }).then(
                    function (success) {
                        var response = success.data
                        $scope.data.config.publisher = response.payload
                        $rootScope.initPubCnf()

                        // $scope.initializePageData();
                        // LOOP ALL PAGES ALREADY LOADED AND ADJUST THE MODULE TYPE
                        if (typeof $rootScope.adjustPageToTheme != 'undefined') {
                            angular.forEach($scope.data.pages, function (page_data, page_id) {
                                if (typeof $scope.data.pages[page_id].publisher != 'undefined') {
                                    $rootScope.adjustPageToTheme(page_id)
                                }
                            })
                        }
                    },
                    function (error) {
                        $log.info(error)
                    }
                )
            }

            // Check if there is error before saving
            // $scope.hasSavingError = function() {
            //   const { store } = require('~redux/store');
            //   const { isValidUrl } = require('~redux/utils/helpers/string');
            //   const vcita_website_url = store.getState().settings.value?.vcita_business_info?.website_url;
            //   if( $scope.data.vars.modified.vcitaBusiness.changed && $scope.data.vars.modified.vcitaBusiness.save && !isValidUrl(vcita_website_url) ){
            //     return true;
            //   }
            //   return false
            // }

            // $scope.getSavingErrorMessage = function() {
            //   let errorMessage = "Unable to save data: \n";
            //   const { store } = require('~redux/store');
            //   const { isValidUrl } = require('~redux/utils/helpers/string');
            //   const vcita_website_url = store.getState().settings.value?.vcita_business_info?.website_url;
            //   if( $scope.data.vars.modified.vcitaBusiness.save && !isValidUrl(vcita_website_url) ){
            //     errorMessage += "Vcita business info's website url is invalid! \n";
            //   }
            //   return errorMessage;
            // }

            $scope.isSome2Save = function () {
                var retval = false

                // Check for Global Design
                angular.forEach($scope.data.vars.modified.modules, function (module, key) {
                    if (module.changed == '1') {
                        retval = true
                    }
                })

                // Check for Pages
                if (!retval) {
                    angular.forEach($scope.data.vars.modified.pages, function (page_data, page_id) {
                        if (!retval && page_data.changed == 1) {
                            retval = true
                        }
                    })
                }

                // Are there pages to delete
                if (!retval && $scope.data.vars.modified.deletePages.changed == 1) {
                    retval = true
                }

                // Is there media to delete
                if (!retval && $scope.data.vars.modified.deleteMedia.changed == 1) {
                    retval = true
                }

                // Check for Navigation
                if (!retval && $scope.data.vars.modified.navs.changed == 1) {
                    retval = true
                }

                // Check for 301 Redirects
                if (!retval && $scope.data.vars.modified.redirects.changed == 1) {
                    retval = true
                }

                // Check for Contact
                if (!retval && $scope.data.vars.modified.contact.changed == 1) {
                    retval = true
                }

                // Check for Social
                if (!retval && $scope.data.vars.modified.social.changed == 1) {
                    retval = true
                }

                // Check for GA Options
                if (!retval && $scope.data.vars.modified.ga_options.changed == 1) {
                    retval = true
                }

                // Check for Imgix Base Url
                if (!retval && $scope.data.vars.modified.imgixBaseUrlData.changed == 1) {
                    retval = true
                }

                // Check for Maintenance
                if (!retval && $scope.data.vars.modified.maintenanceData.changed == 1) {
                    retval = true
                }

                // Check for SEO
                if (!retval && $scope.data.vars.modified.seo.changed == 1) {
                    retval = true
                }

                // Check for vcita
                if (!retval && $scope.data.vars.modified.vcita.changed == 1) {
                    retval = true
                }

                // Check for vcita Business
                if (!retval && $scope.data.vars.modified.vcitaBusiness.changed == 1) {
                    retval = true
                }

                // Is there posts to delete
                if (!retval && $scope.data.vars.modified.deletePosts.changed == 1) {
                    retval = true
                }

                // Check for Blog Posts
                if (!retval && $scope.data.vars.modified.blogging.changed == 1) {
                    retval = true
                }

                // Is there categories to delete
                if (!retval && $scope.data.vars.modified.deleteCategories.changed == 1) {
                    retval = true
                }

                // Check for Blog Posts
                if (!retval && $scope.data.vars.modified.tags.changed == 1) {
                    retval = true
                }

                if (!retval && $scope.data.vars.modified.posts.changed == 1) {
                    retval = true
                }

                // Check for Templates / Footer UI
                if (!retval && $scope.data.vars.modified.composites.changed == 1) {
                    retval = true
                }

                // Forms
                if (!retval && typeof $rootScope.getModifiedForms != 'undefined') {
                    angular.forEach($scope.data.vars.modified.frms, function (frm_data, frm_id) {
                        retval = true
                    })
                }

                return retval
            }

            $scope.save = function () {
                //console.log("Start Saving")

                // if($scope.hasSavingError()){
                //   alert( $scope.getSavingErrorMessage() );
                //   return false;
                // }

                var data = {},
                    refresh = false

                // Get selected modules to save
                angular.forEach($scope.data.vars.modified.modules, function (module, key) {
                    if (module.save == '1') {
                        ////console.log(key)
                        if (key == 'logos') {
                            data[key] = $rootScope.getLogoObjectForSaving()
                        } else if (key == 'favicon') {
                            data[key] = $scope.data.config.website.favicon.src
                        } else {
                            data[key] = $scope.data.design[key]
                        }

                        if (key == 'themes') {
                            refresh = true
                        }
                    }
                })

                // Get selected modified Pages for saving
                angular.forEach($scope.data.vars.modified.pages, function (page_data, page_id) {
                    if (page_data.save == 1 && typeof $scope.data.pages[page_id] != 'undefined') {
                        if (typeof data['pages'] == 'undefined') {
                            data['pages'] = {}
                        }

                        // FIX ANY SLUGS CHANGED PAGES & SEO

                        data['pages'][page_id] = {
                            data: page_data.what.data == 1 ? $rootScope.encode(angular.copy($scope.data.pages[page_id].publisher.data)) : {},
                            attrs: page_data.what.attrs == 1 ? $rootScope.getPageAttrs($scope.data.pages[page_id]) : {},
                            seo: page_data.what.seo == 1 ? angular.copy($scope.data.pages[page_id].seo) : {},
                        }
                    }
                })

                // Set pages to remove if any
                if ($scope.data.vars.modified.deletePages.changed == 1 && $scope.data.vars.modified.deletePages.save == 1) {
                    //console.log("Remove Pages");
                    data['deletePages'] = $scope.data.vars.pagesToDelete
                }

                // Set media to remove if any
                if ($scope.data.vars.modified.deleteMedia.changed == 1 && $scope.data.vars.modified.deleteMedia.save == 1) {
                    //console.log("Remove Media");
                    data['deleteMedia'] = $scope.data.vars.mediaToDelete
                }

                // Get navigation to save
                if (typeof $rootScope.saveNavigation != 'undefined' && $scope.data.vars.modified.navs.save == 1) {
                    //console.log("Navigation")
                    data['navs'] = $rootScope.saveNavigation()
                }

                // Get 301 redirects to save
                if (typeof $rootScope.saveRedirects != 'undefined' && $scope.data.vars.modified.redirects.save == 1) {
                    //console.log("301 redirects")
                    data['redirects'] = $rootScope.saveRedirects()
                }

                // Get contact to save
                if (
                    typeof $rootScope.saveContacts != 'undefined' &&
                    $scope.data.vars.modified.contact.save == 1 &&
                    $scope.data.vars.modified.contact.changed == 1
                ) {
                    //console.log("Contact");
                    data['contact'] = $rootScope.saveContacts()
                }

                // Get social to save
                if (
                    typeof $rootScope.saveSocial != 'undefined' &&
                    $scope.data.vars.modified.social.save == 1 &&
                    $scope.data.vars.modified.social.changed == 1
                ) {
                    //console.log("Social");
                    data['social'] = $rootScope.saveSocial()
                }

                // Get Imgix Base Url to save
                if (
                    typeof $rootScope.saveImgixBaseUrl != 'undefined' &&
                    $scope.data.vars.modified.imgixBaseUrlData.save == 1 &&
                    $scope.data.vars.modified.imgixBaseUrlData.changed == 1
                ) {
                    //console.log("Social");
                    data['imgixBaseUrlData'] = $rootScope.saveImgixBaseUrl()
                }

                // Get maintenance to save
                if (
                    typeof $rootScope.saveMaintenance != 'undefined' &&
                    $scope.data.vars.modified.maintenanceData.save == 1 &&
                    $scope.data.vars.modified.maintenanceData.changed == 1
                ) {
                    //console.log("Social");
                    data['maintenanceData'] = $rootScope.saveMaintenance()
                }

                // Get Vcita to save
                if (
                    typeof $rootScope.saveVcitaSettings != 'undefined' &&
                    $scope.data.vars.modified.vcita.save == 1 &&
                    $scope.data.vars.modified.vcita.changed == 1
                ) {
                    data['vcitaData'] = $rootScope.saveVcitaSettings()
                }

                // Get VcitaBusiness to save
                if (
                    typeof $rootScope.saveVcitaBusinessInfo != 'undefined' &&
                    $scope.data.vars.modified.vcitaBusiness.save == 1 &&
                    $scope.data.vars.modified.vcitaBusiness.changed == 1
                ) {
                    data['vcitaBusinessData'] = $rootScope.saveVcitaBusinessInfo()
                }

                // Get seo to save
                if (typeof $rootScope.saveSEO != 'undefined' && $scope.data.vars.modified.seo.changed == 1 && $scope.data.vars.modified.seo.save == 1) {
                    //console.log("SEO");
                    data['seo'] = $rootScope.saveSEO()
                }

                // Get templates / footer ui to save
                if (
                    typeof $rootScope.saveTemplates != 'undefined' &&
                    $scope.data.vars.modified.composites.changed == 1 &&
                    $scope.data.vars.modified.composites.save == 1
                ) {
                    //console.log("SEO");
                    data['composites'] = $rootScope.saveTemplates()
                }

                // Set posts to remove if any
                if ($scope.data.vars.modified.deletePosts.changed == 1 && $scope.data.vars.modified.deletePosts.save == 1) {
                    //console.log("Remove Media");
                    data['deletePosts'] = $scope.data.vars.postsToDelete
                }

                // Get blog posts ui to save
                if (
                    typeof $rootScope.saveCategories != 'undefined' &&
                    $scope.data.vars.modified.blogging.changed == 1 &&
                    $scope.data.vars.modified.blogging.save == 1
                ) {
                    //console.log("blog posts - categories");
                    data['categories'] = $rootScope.saveCategories()
                }

                // Set categories to remove if any
                if ($scope.data.vars.modified.deleteCategories.changed == 1 && $scope.data.vars.modified.deleteCategories.save == 1) {
                    //console.log("Remove Media");

                    var arr = []
                    angular.forEach($scope.data.vars.categoriesToDelete, function (item, value) {
                        arr.push(value)
                    })
                    $scope.data.vars.categoriesToDelete = arr
                    data['deleteCategories'] = $scope.data.vars.categoriesToDelete
                }

                // Get blog posts ui to save tags
                if (typeof $rootScope.saveTags != 'undefined' && $scope.data.vars.modified.tags.changed == 1 && $scope.data.vars.modified.tags.save == 1) {
                    //console.log("blog posts - categories");
                    data['tags'] = $rootScope.saveTags()
                }

                // Get blog posts ui to save
                if (
                    typeof $rootScope.saveBlogPosts != 'undefined' &&
                    $scope.data.vars.modified.posts.changed == 1 &&
                    $scope.data.vars.modified.posts.save == 1
                ) {
                    //console.log("blog posts");
                    data['posts'] = $rootScope.saveBlogPosts()
                }

                // Get selected Forms to save
                if (typeof $scope.data.vars.modified.frms != 'undefined') {
                    angular.forEach($scope.data.vars.modified.frms, function (frm, i) {
                        if (frm.save != 1) {
                            return
                        }

                        // dalbert: New forms data has objectId.
                        if (frm.objectId) {
                            if ($scope.data.forms2.byObjectId[frm.objectId]) {
                                const { confirmations, notifications, ...form } = $scope.data.forms2.byObjectId[frm.objectId]

                                const preparedFormData = {
                                    id: frm.id || -1,
                                    objectId: frm.objectId,
                                    form,
                                    confirmations,
                                    notifications,
                                }
                                data.forms = [].concat(data.forms || [], preparedFormData)
                            }
                        } else {
                            var curForm = 'form_' + frm.id
                            if ($scope.data.frms && typeof $scope.data.frms.formDataObjects[curForm]) {
                                var saveFormDataObject = {
                                    id: frm.id,
                                    form: $scope.data.frms.formDataObjects[curForm].formData,
                                    confirmations: $scope.data.frms.formDataObjects[curForm].confirmationsData,
                                    notifications: $scope.data.frms.formDataObjects[curForm].notificationsData,
                                }
                                if (typeof data['forms'] == 'undefined') {
                                    data['forms'] = []
                                }
                                data['forms'].push(saveFormDataObject)
                            }
                        }
                    })
                }

                //check if vcita lead injection option is selected.
                if ($scope.data.frms) {
                    if ($scope.data.frms.form) {
                        if ($scope.data.frms.form.metadata) {
                            if ($scope.data.frms.form.metadata.vcitaLeadInjection) {
                                let vcitaHasEmailField = false
                                let vcitaHasNameField = false

                                if ($scope.data.frms.form.metadata.vcita) {
                                    vcitaHasNameField =
                                        $scope.data.frms.form.metadata.vcita.first_name_to_field == '-' ||
                                        $scope.data.frms.form.metadata.vcita.first_name_to_field == '' ||
                                        $scope.data.frms.form.metadata.vcita.first_name_to_field == null
                                            ? false
                                            : true

                                    vcitaHasEmailField =
                                        $scope.data.frms.form.metadata.vcita.email_to_field == '-' ||
                                        $scope.data.frms.form.metadata.vcita.email_to_field == '' ||
                                        $scope.data.frms.form.metadata.vcita.email_to_field == null
                                            ? false
                                            : true
                                }

                                if (!vcitaHasEmailField || !vcitaHasNameField) {
                                    alert('Vcita lead injection option is selected. Please make sure firstname and email fields are mapped.')
                                    return false
                                }

                                if ($scope.formFieldChanges.length > 0) {
                                    alert('Please re-map the following vcita fields: ' + $scope.formFieldChanges.join(','))
                                    return false
                                }
                            }
                        }
                    }
                }

                if (Object.keys(data).length > 0) {
                    /*     var url_to_data = env.settings.is_new_render
                        ? env.settings.laravelApiUrl + 'savedata/' + env.settings.website_id
                        : $scope.data.vars.tsiCmsVars.apiUrl + '?action=WpTsiCmsApi&command=save' */

                    var url_to_data = env.settings.is_new_render
                        ? env.settings.laravelApiUrl + 'savedata/' + env.settings.website_id
                        : $scope.data.vars.tsiCmsVars.apiUrl + ''
                    const request = {
                        method: 'POST',
                        // url: url_to_data,
                        url: 'https://cms-routes.vercel.app/pages',
                        data: data,
                    }
                    /* 
                    const requestVercel = {
                        method: 'POST',
                        url: 'https://cms-routes.vercel.app/pages',
                        data: data,
                    } */

                    $http(request, requestVercel)
                        .then(
                            function (success) {
                                var response = success.data.payload

                                $scope.makeBackup(data, true)

                                if (typeof data.deletePages != 'undefined') {
                                    angular.forEach(data['deletePages'], function (i, page_id) {
                                        // console.log("Remove from pages " + page_id)
                                        delete $scope.data.vars.pagesToDelete[page_id]
                                        delete $scope.data.pages[page_id]
                                    })
                                }

                                if (response && typeof response.media != 'undefined') {
                                    $scope.data.vars.mediaToDelete = {}
                                    $scope.data.images.uploaded = response.media.uploaded
                                    $scope.data.images.purchased = response.media.purchased
                                    $rootScope.setImagesUsage()
                                }

                                if (typeof data.deletePosts != 'undefined') {
                                    var setNewPostItem = false
                                    var lengthOfDelete = Object.keys($scope.data.vars.postsToDelete).length
                                    var lengthOfPosts = Object.keys($scope.data.posts).length

                                    //console.log("Posts=", data.deletePosts);

                                    angular.forEach(data['deletePosts'], function (i, post_id) {
                                        if (post_id == $rootScope.blogPostItemId) {
                                            setNewPostItem = true
                                        }
                                        delete $scope.data.vars.postsToDelete[post_id]
                                        delete $scope.data.posts[post_id]
                                    })

                                    if (setNewPostItem && lengthOfPosts - lengthOfDelete != 0) {
                                        $rootScope.checkIfEmptyPostId(undefined)
                                    }
                                }

                                if (typeof data.deleteCategories != 'undefined') {
                                    if (response.deleteCategories.categories_blocked) {
                                        angular.forEach(response.deleteCategories.categories_blocked, function (item, value) {
                                            angular.forEach($scope.data.vars.categoriesToDelete, function (key, val) {
                                                if (value == key) {
                                                    var index = $scope.data.vars.categoriesToDelete.indexOf(key)
                                                    $scope.data.vars.categoriesToDelete.splice(index, 1)
                                                }
                                            })
                                        })

                                        data['deleteCategories'] = $scope.data.vars.categoriesToDelete
                                    }

                                    angular.forEach(data['deleteCategories'], function (i, cat_id) {
                                        var indexCat = $scope.data.blogging.categories.findIndex((item) => item.id == i)

                                        if (indexCat != -1) {
                                            delete $scope.data.vars.categoriesToDelete[i]
                                            $scope.data.blogging.categories.splice(indexCat, 1)
                                        }

                                        var indexTag = $scope.data.blogging.tags.findIndex((item) => item.id == i)
                                        if (indexTag != -1) {
                                            delete $scope.data.vars.categoriesToDelete[i]
                                            $scope.data.blogging.tags.splice(indexTag, 1)
                                        }
                                    })
                                }

                                if ($scope.data.vars.loadSite == 1 && refresh) {
                                    $log.info('Refreshing website')
                                    $('#website').attr('src', $('#website').attr('src'))
                                }

                                if (response) {
                                    // DM:Forms: Call formsSaveAllDataSync to sync data with forms objects
                                    // ie. backups, newId for new forms, new objects, etc...
                                    if (typeof $rootScope.formsSaveAllDataSync != 'undefined' && typeof response.forms != 'undefined') {
                                        $rootScope.formsSaveAllDataSync(response)
                                    }

                                    if (env.settings.is_new_render) {
                                        if (response.navs) {
                                            //replace temporary menu_item ids with permanent ones
                                            if (response.navs.new_items_map) $rootScope.replaceNavTempIdsWithReal(response.navs.new_items_map)
                                            if (response.navs.items_removed || response.navs.lists_removed)
                                                $rootScope.resetNavDeleted(response.navs.items_removed, response.navs.lists_removed)

                                            if (response.navs.updated_data) {
                                                $scope.data.navigation = response.navs.updated_data
                                                $rootScope.reloadNavigation()
                                            }
                                        }

                                        if (response.posts) {
                                            //replace temporary post ids with permanent ones
                                            if (response.posts.new_items_map) {
                                                $rootScope.replacePostTempIdsWithReal(response.posts.new_items_map)
                                            }

                                            if (response.posts.updated_data) {
                                                $rootScope.replacePostSlugs(response.posts.updated_data)
                                            }
                                        }

                                        if (response.categories) {
                                            //replace temporary category ids with permanent ones
                                            if (response.categories.new_items_map) {
                                                $rootScope.replaceCategoryTempIdsWithReal(response.categories.new_items_map)
                                            }
                                            if (response.categories.updated_data) {
                                                if (typeof $rootScope.replaceCategorySlugs === 'function') {
                                                    $rootScope.replaceCategorySlugs(response.categories.updated_data)
                                                }
                                                if (typeof $rootScope.updatePostsCountsCats === 'function') {
                                                    $rootScope.updatePostsCountsCats(response.categories.updated_data)
                                                }
                                                // $rootScope.replaceCategorySlugs(response.categories.updated_data);
                                                // $rootScope.updatePostsCountsCats(response.categories.updated_data);
                                            }
                                        }

                                        if (response.deleteCategories) {
                                            angular.forEach(response.deleteCategories.categories_blocked, function (value, key) {
                                                var index = response.deleteCategories.updated_data.categories.findIndex((i) => i.id == key)
                                                if (index > -1) {
                                                    alert(
                                                        'Cannot delete category ' +
                                                            response.deleteCategories.updated_data.categories[index].name +
                                                            '.\n\n ' +
                                                            'Reason: ' +
                                                            JSON.stringify(value)
                                                    )
                                                }
                                            })
                                        }

                                        if (response.tags) {
                                            //replace temporary category ids with permanent ones
                                            if (response.tags.new_items_map) {
                                                $rootScope.replaceTagTempIdsWithReal(response.tags.new_items_map)
                                            }
                                            if (response.tags.updated_data) {
                                                if (typeof $rootScope.replaceTagSlugs === 'function') {
                                                    $rootScope.replaceTagSlugs(response.tags.updated_data)
                                                }
                                                if (typeof $rootScope.updatePostsCountsTags === 'function') {
                                                    $rootScope.updatePostsCountsTags(response.tags.updated_data)
                                                }
                                                // $rootScope.replaceTagSlugs(response.tags.updated_data);
                                                // $rootScope.updatePostsCountsTags(response.tags.updated_data);
                                            }
                                        }

                                        //adding cashe flush
                                        // $scope.flush_cache();
                                    } else {
                                        if (typeof response.navs !== 'undefined' && response.navs.updated_data)
                                            $scope.data.navigation = response.navs.updated_data
                                    }
                                }

                                return response
                            },
                            function (error) {
                                alert('Error : ' + error.statusText)
                            }
                        )
                        .then(function (response) {
                            if ($scope.data.vars.modified.frms.length > 0) {
                                $scope.data.vars.modified.frms = $scope.data.vars.modified.frms.filter((form) => form.save !== 1)
                            }

                            $rootScope.$broadcast('cms.onSave', { request, response })
                            // $rootScope.$broadcast('cms.onSave', { requestVercel, response })

                            const { getCurrentFrameworkType, syncScopeDataToReduxStore } = require('~redux/utils/core/angular-redux-connect')
                            // Sync Angularjs back to React:
                            syncScopeDataToReduxStore($scope.data)

                            return response
                        })
                }

                //console.log("End Saving")
            }

            $rootScope.encode = function (data) {
                if (typeof data.JS != 'undefined') {
                    $scope.data.pages[$scope.data.vars.curr_page_id].title = $rootScope.strEncode($scope.data.pages[$scope.data.vars.curr_page_id].title)
                    data.JS = $rootScope.strEncode(data.JS, false)
                }

                if (typeof data.head_script != 'undefined') {
                    data.head_script = $rootScope.strEncode(data.head_script, false)
                }

                angular.forEach(data.modules, function (modules, column) {
                    angular.forEach(modules, function (module_data, module_id) {
                        angular.forEach(module_data, function (module_value, module_key) {
                            if (module_key != 'items' && typeof module_value == 'string') {
                                data.modules[column][module_id][module_key] = $rootScope.strEncode(module_value)
                            }
                        })
                        angular.forEach(module_data.items, function (item, item_id) {
                            angular.forEach(item, function (value, key) {
                                var string = $rootScope.strEncode(value, key == 'desc' ? false : true)
                                if (key == 'desc') {
                                    string = $rootScope.replaceHTMLforEncode(string)
                                }
                                data.modules[column][module_id].items[item_id][key] = string
                            })
                        })
                    })
                })
                return data
            }

            $rootScope.replaceHTMLforEncode = function (string) {
                string = string
                    .replace(/\[rn\]\[t\]\<li\>/gi, '<li>')
                    .replace(/\[t\]/gi, '')
                    .replace(/\<\/li\>\[rn\]/gi, '</li>')

                string = string.replace(/\[rn\]\s*\<(\/*)t(d|h|r)/gi, '<$1t$2').replace(/\[rn\]\s*\<(\/*)(table|thead|tfoot|tbody)/gi, '<$1$2')

                string = string.replace(/\<\/p\>(\[rn\])+\<p\>/gi, '</p><p>').replace(/\<\/p\>\[rn\]/gi, '</p>')

                string = string.replace(/\<br\s*\/\>/gi, '<br>').replace(/\<br\>\[rn\]/gi, '<br>')

                return string
            }

            $rootScope.encodeCompositeData = function (data) {
                angular.forEach(data, function (property_value, property_name) {
                    if (property_name != 'modules' && typeof property_value == 'string') {
                        data[property_name] = $rootScope.strEncode(property_value)
                    } else {
                        angular.forEach(data.modules, function (module_data, module_id) {
                            if (module_id != 'items' && typeof module_data == 'string') {
                                data.modules[module_id] = $rootScope.strEncode(module_data)
                            } else {
                                angular.forEach(data.modules.items, function (item_data, item_id) {
                                    angular.forEach(item_data, function (value, key) {
                                        var string = $rootScope.strEncode(value, key == 'text' ? false : true)
                                        if (key == 'text') {
                                            string = $rootScope.replaceHTMLforEncode(string)
                                        }
                                        data.modules.items[item_id][key] = string
                                    })
                                })
                            }
                        })
                    }
                })
                return data
            }

            $rootScope.strEncode = function (str, newline) {
                if (typeof str == 'string') {
                    var newline = typeof newline == 'undefined' ? true : newline,
                        rn = newline ? '' : '[rn]',
                        tab = newline ? '' : '[t]',
                        replaceWordChars = function (text) {
                            var s = text
                            // smart single quotes and apostrophe
                            s = s.replace(/[\u2018\u2019\u201A]/g, "'")
                            // smart double quotes
                            s = s.replace(/[\u201C\u201D\u201E\u2033]/g, '"')
                            // line separator
                            s = s.replace(/\u2028/g, rn)
                            // ellipsis
                            s = s.replace(/\u2026/g, '...')
                            // dashes
                            s = s.replace(/[\u2013\u2014]/g, '-')
                            // circumflex
                            s = s.replace(/\u02C6/g, '^')
                            // open angle bracket
                            s = s.replace(/\u2039/g, '<')
                            // close angle bracket
                            s = s.replace(/\u203A/g, '>')
                            // spaces
                            s = s.replace(/[\u02DC\u00A0]/g, ' ')
                            return s
                        }

                    var str = !str
                        ? ''
                        : replaceWordChars(str)
                              .replace(/'/g, '&#39;')
                              .replace(/\"/g, '&quot;')
                              .replace(/"/g, '&quot;')
                              .replace(/(?:\r\n|\r|\n)/g, rn)
                              .replace(/(?:\t)/g, tab)
                    str = str.replace(/\\\\/g, '&#92;').replace(/\\/g, '&#92;')

                    return str
                } else {
                    return !str ? '' : str
                }
            }

            $rootScope.strDecode = function (str) {
                if (typeof str == 'string') {
                    var str = !str
                        ? ''
                        : str
                              .replace(/\&\#39;/g, "'")
                              .replace(/\&quot;/g, '"')
                              .replace(/\[rn\]/g, '\r\n')
                              .replace(/\[t]/g, '\t')
                    str = str.replace(/\&#92;/g, '\\')

                    return str
                } else {
                    return !str ? '' : str
                }
            }

            $scope.cancel = function () {
                if (confirm('Are you sure you want to revert all changes?')) {
                    /*

				*/
                }
            }

            $scope.close = function () {
                var iframe = jQuery('iframe#website')
                if (iframe.length != 0) {
                    iframe[0].contentWindow.close()
                    document.cookie = 'isTsi15=; expires=Thu, 01 Jan 1970 00:00:00 UTC'
                }
                document.location.href = '/'
            }

            $rootScope.logout = function () {
                if (env.settings.is_new_render) {
                    TsiAuthentication.logout().then(function () {
                        $state.go('login')
                    })
                } else {
                    $http.get($scope.data.vars.tsiCmsVars.apiUrl + '?action=WpTsiCmsApi&command=logOut').then(function (response) {
                        $scope.close()
                    })
                }
            }

            $scope.flush_cache = function () {
                if (env.settings.is_new_render) {
                    var w_endpoint = env.settings.cmsBaseUrl + env.settings.cmsFlushUrl + '?' + Date.now()
                    return $http({
                        method: 'GET',
                        url: w_endpoint,
                    }).then(function (response) {
                        // console.log('flush_cache', response.data);
                    })
                }
            }

            $rootScope.isPlaceHolder = function (name) {
                return !name || name == '' || name.indexOf('placehold') >= 0 ? true : false
            }

            $rootScope.isHomePage = function (id) {
                return $scope.data.config.website.frontPageId == id
            }

            $rootScope.setPageForDelete = function (id) {
                if (typeof $scope.data.vars.pagesToDelete[id] == 'undefined') {
                    //console.log("adding: " + id)
                    $scope.data.vars.pagesToDelete[id] = 1
                } else {
                    //console.log("removing: " + id)
                    delete $scope.data.vars.pagesToDelete[id]
                }

                // $rootScope.removeMenuItemFromListByPageId(id); //MOVE THIS TO RIGHT BEFORE SAVING
            }

            // $rootScope.removeMenuItemFromListByPageId = function(pageId) {
            //  // HE PROBKLEM WITH THIS IS HAVING TO DELETE THE ITEM FROM THE UI AND REDRAW THE TREE. TOO MANY THINGS CAN GO WRONG
            // 	const menu_slug = $scope.data.navigation.menu_list[0].slug;

            // 	if (typeof $scope.data.vars.navigation == "undefined") $scope.data.vars.navigation = {
            // 		deletedMenuItems: []
            // 	}

            // 	// FIND POSSIBLE CHILDS OF THE PAGE AND MOVE IT TO PAGE PARENT
            // 	let items = angular.copy($scope.data.navigation.menu_items[menu_slug]);
            // 	console.log("A => ", items)
            // 	items.forEach(item => {
            // 		if (item.object_id == pageId) {
            // 			$scope.data.vars.navigation.deletedMenuItems.push(item.ID);

            // 			// if (typeof item.submenu != "undefined") {
            // 			// 	const childs = angular.copy(item.submenu);
            // 			// 	childs.forEach(child => {
            // 			// 		child.menu_item_parent = item.menu_item_parent;
            // 			// 	});
            // 			// 	item.submenu = [];
            // 			// 	console.log("Childs :: ", childs, childs.length);
            // 			// }

            // 			items.forEach(child => {
            // 				child.menu_item_parent = item.menu_item_parent;
            // 			})
            // 		}
            // 	});
            // 	console.log("B => ", items)

            // 	// REMOVE SELECTED ITEM FROM THE LIST
            // 	// $scope.data.navigation.menu_items[menu_slug] = items.filter(item => {
            // 	// 	return item.object_id != pageId
            // 	// })
            // 	// console.log("C => ", $scope.data.navigation.menu_items[menu_slug])

            // 	// WOW. THE FREAKING MENU ITEMS IS IN MANY PLACES ::((
            // 	// $scope.data.vars.navigation.menuList = $scope.data.navigation.menu_items[$scope.data.vars.navigation.currentMenuName]
            // 	// $scope.data.vars.navigation.currentMenus[$scope.data.vars.navigation.currentMenuName] = $scope.data.vars.navigation.menuList;

            // 	console.log($scope.data.vars.navigation)
            // };

            $rootScope.isPageForDelete = function (id) {
                return typeof $scope.data.vars.pagesToDelete[id] == 'undefined' ? false : true
            }

            $rootScope.setMediaForDelete = function (ind, id) {
                if (typeof $scope.data.vars.mediaToDelete[id] == 'undefined') {
                    //console.log("adding: " + id)
                    $scope.data.vars.mediaToDelete[id] = ind
                } else {
                    //console.log("removing: " + id)
                    delete $scope.data.vars.mediaToDelete[id]
                }
            }

            $rootScope.isMediaForDelete = function (id) {
                return typeof $scope.data.vars.mediaToDelete[id] == 'undefined' ? false : true
            }

            $rootScope.setPostForDelete = function (id) {
                if (typeof $scope.data.vars.postsToDelete[id] == 'undefined') {
                    $scope.data.vars.postsToDelete[id] = 1
                    //angular.forEach($scope.data.posts[id].categories_ids, function(key,value){
                    //
                    //});
                } else {
                    delete $scope.data.vars.postsToDelete[id]
                }
            }

            $rootScope.isPostForDelete = function (id) {
                return typeof $scope.data.vars.postsToDelete[id] == 'undefined' ? false : true
            }

            $rootScope.setCategoryForDelete = function (id) {
                if (typeof $scope.data.vars.categoriesToDelete[id] == 'undefined') {
                    $scope.data.vars.categoriesToDelete[id] = 1
                } else {
                    delete $scope.data.vars.categoriesToDelete[id]
                }
            }

            $rootScope.isCategoryForDelete = function (id) {
                return typeof $scope.data.vars.categoriesToDelete[id] == 'undefined' ? false : true
            }

            $rootScope.getWebsiteWindows = function () {
                var iframe = jQuery('#website')
                var websites = []

                if (iframe.length != 0) {
                    websites.push(iframe[0].contentWindow || iframe[0].contentDocument)
                    websites.push($scope.data.vars.website)
                }

                return websites
            }

            $scope.browsePage = function () {
                var websites = $rootScope.getWebsiteWindows()

                angular.forEach(websites, function (website) {
                    if (typeof website != 'undefined' && website.document) {
                        if (website.document.location.href != 'about:blank') {
                            website.document.location.href = $scope.data.vars.current_page_url + '?isTsi15=ON&' + Date.now()
                        }
                    }
                })
            }

            $scope.reloadWebsite = function () {
                var pageUrl = typeof pageUrl == 'undefined' ? '' : pageUrl,
                    websites = $rootScope.getWebsiteWindows()

                angular.forEach(websites, function (website) {
                    if (typeof website != 'undefined' && website.document) {
                        if (website.document.location.href != 'about:blank') {
                            if (typeof $scope.data.vars.curr_page_id != 'undefined' && typeof $scope.data.pages[$scope.data.vars.curr_page_id] != 'undefined') {
                                var href = ($scope.data.pages[$scope.data.vars.curr_page_id].url + '/?isTsi15=ON&' + Date.now()).replace(/\/\//g, '/')
                                website.document.location.href = href
                            } else {
                                website.document.location.reload(true)
                            }
                        }
                    }
                })
            }

            $scope.previewChanged = function (page_id) {
                return typeof $scope.data.pages[page_id].publisher == 'object' &&
                    !angular.equals($scope.data.pages[page_id].preview, $scope.data.pages[page_id].publisher.data)
                    ? true
                    : false
            }

            $scope.compositePreviewChanged = function (composite_id) {
                if ($scope.data.composites_preview) {
                    return !angular.equals($scope.data.composites_preview[composite_id], $scope.data.composites[composite_id])
                }
                return false
            }

            $rootScope.refreshWebsite = function () {
                // Get Modified Pages to save preview in the DB
                var pages = {},
                    composites = {},
                    savePreview = false

                angular.forEach($scope.data.pages, function (page_data, page_id) {
                    if ($scope.previewChanged(page_id)) {
                        savePreview = true
                        pages[page_id] = $rootScope.encode(angular.copy($scope.data.pages[page_id].publisher.data))
                    }
                })

                // console.log($scope.data.composites);

                angular.forEach($scope.data.composites, function (composite_data, composite_id) {
                    if ($scope.compositePreviewChanged(composite_id)) {
                        savePreview = true
                        composites[composite_id] = $rootScope.encodeCompositeData(angular.copy($scope.data.composites[composite_id]))
                    }
                })

                if (savePreview) {
                    var url_to_data = env.settings.is_new_render
                        ? env.settings.laravelApiUrl + 'savepreview/' + env.settings.website_id
                        : $scope.data.vars.tsiCmsVars.apiUrl + '?action=WpTsiCmsPublisherApi&command=savePreview'

                        console.log(pages)

                    $http({
                        method: 'POST',
                        // url: url_to_data,
                        url: 'https://cms-routes.vercel.app/pages',
                        data: {
                            code: $scope.data.design.code,
                            pages: pages,
                            composites: composites,
                        },
                    }).then(
                        function (success) {
                            if (env.settings.is_new_render) {
                                if (typeof success.data.payload.pages != 'undefined');
                                angular.forEach(success.data.payload.pages, function (page_id) {
                                    $scope.data.pages[page_id].preview = angular.copy($scope.data.pages[page_id].publisher.data)
                                })

                                if (typeof success.data.payload.composites != 'undefined');
                                angular.forEach(success.data.payload.composites, function (composite_id) {
                                    $scope.data.composites_preview[composite_id] = angular.copy($scope.data.composites[composite_id])
                                })
                            } else {
                                //WP side - do not support preview of composites yet
                                var IDs = success.data.payload
                                angular.forEach(IDs, function (page_id) {
                                    $scope.data.pages[page_id].preview = angular.copy($scope.data.pages[page_id].publisher.data)
                                })
                            }
                            $scope.reloadWebsite()
                        },
                        function (error) {
                            alert('Error : ' + error.statusText)
                            $scope.reloadWebsite()
                        }
                    )
                } else {
                    $scope.reloadWebsite()
                }
            }

            $rootScope.block_old_PP = function () {
                var block = 0,
                    isUsrListed = $scope.data.vars.user.data.blockCustomCode == 0

                if (!isUsrListed) {
                    var theme = $scope.data.design.themes.selected,
                        blocked_themes = {
                            'beacon-theme_charlotte': '',
                            'beacon-theme_ignite': '',
                            'beacon-theme_tsi-v3': '',
                        }

                    if (typeof blocked_themes[theme] != 'undefined') {
                        block = 1
                    }
                }

                return block
            }

            $scope.isImageUsed_bkgrds = function (image) {
                var isUsed = false
                var sections = ['main', 'header', 'footer']
                for (var s = 0; s < sections.length; s++) {
                    //if (typeof $scope.data.design.bkgrds[sections[s]].src.indexOf(image)) console.log(sections[s], '-', image, "-", $scope.data.design.bkgrds[sections[s]].src, "-", $scope.data.design.bkgrds[sections[s]].src.indexOf(image))

                    if ($scope.data.design.bkgrds[sections[s]].src.indexOf(image) != -1) {
                        isUsed = true
                        break
                    }
                }
                return isUsed
            }

            $scope.isImageUsed_logo = function (image) {
                var isUsed = false
                var sections = ['header', 'footer', 'mobile']
                for (var s = 0; s < sections.length; s++) {
                    if (isUsed) break
                    for (var slot = 0; slot < 3; slot++) {
                        if (
                            typeof $scope.data.logos[sections[s]].slots[slot] != 'undefined' &&
                            typeof $scope.data.logos[sections[s]].slots[slot].image_src != 'undefined' &&
                            $scope.data.logos[sections[s]].slots[slot].image_src.indexOf(image) != -1
                        ) {
                            isUsed = true
                            break
                        }
                    }
                }
                return isUsed
            }

            $scope.isImageUsed_publisher = function (image) {
                var isUsed = false

                return isUsed
            }

            $rootScope.setImagesUsage = function () {
                // Check who belongs to whom

                var arr = ['uploaded', 'free', 'purchased']
                arr.forEach(function (section) {
                    angular.forEach($scope.data.images[section], function (image, key) {
                        var isUsed = ''

                        if (isUsed == '') isUsed = $scope.isImageUsed_logo(image.src) ? 'logo' : ''
                        if (isUsed == '') isUsed = $scope.isImageUsed_bkgrds(image.src) ? 'bkgrds' : ''
                        //if (isUsed=="") isUsed = $scope.isImageUsed_publisher(image.src) ? "items" : "";

                        $scope.data.images[section][key].used = isUsed

                        if (isUsed != '') {
                            return
                        }
                    })
                })
            }

            // $scope.updateReactLocalStorage = function(imgObj) {
            // 	// add to new media react tool
            // 	console.log("imgObj", imgObj)
            // 	let uploaded = JSON.parse(localStorage.getItem('uploaded_media'));
            // 	if (!uploaded) uploaded = [];
            // 	uploaded.push(imgObj);
            // 	console.log("uploaded", uploaded)
            // 	localStorage.setItem('uploaded_media', JSON.stringify(uploaded));
            // }

            $rootScope.uploadMedia = function (section, files) {
                // console.log("uploadMedia :: " + section, files)
                if (files && files.length) {
                    //for (var i = 0; i < files.length; i++) {
                    //var file = files[i];
                    var file = files.shift()
                    if (!file.$error) {
                        // console.log("file", file);

                        var url_to_data = env.settings.is_new_render
                            ? env.settings.laravelApiUrl + 'uploadmedia/' + env.settings.website_id
                            : $scope.data.vars.tsiCmsVars.apiUrl + '?action=WpTsiCmsPublisherApi&command=uploadMedia'

                        // console.log("url_to_data", url_to_data, file);

                        Upload.upload({
                            url: url_to_data, //$scope.data.vars.tsiCmsVars.apiUrl + '?action=WpTsiCmsPublisherApi&command=uploadMedia',
                            method: 'POST',
                            file: file,
                        }).then(
                            function (resp) {
                                $timeout(function () {
                                    var imgObj = resp.data.payload
                                    $scope.data.vars.media.lastUploaded = imgObj

                                    if (section == 'mediaItem') {
                                        // console.log("Just add to Media uploaded items", imgObj);

                                        if ($scope.data.images.uploaded) $scope.data.images.uploaded.unshift(imgObj)
                                        if (files.length) $rootScope.uploadMedia(section, files)
                                    } else {
                                        if (section != 'bloggingImg') {
                                            var module_id = $scope.data.vars.page.tmp.curr_mod_id,
                                                item_ind = $scope.data.vars.page.tmp.curr_item_ind
                                        }

                                        var attach_id = imgObj.attach_id,
                                            HTTP_HOST = imgObj.HTTP_HOST,
                                            width = imgObj.width,
                                            height = imgObj.height,
                                            size = imgObj.size,
                                            src = env.settings.is_new_render && imgObj.src ? imgObj.src : imgObj.guid.split(HTTP_HOST).pop()

                                        //console.log(section + " :: src :: " + src);

                                        if (section == 'addItems') {
                                            // console.log("imgObj", imgObj)
                                            $rootScope.addModuleItem($scope.data.vars.page.tmp.curr_mod_id, imgObj) //
                                            if (files.length) $rootScope.uploadMedia(section, files)
                                        } else if (section == 'itemImg') {
                                            //console.log(module_id + ", " + item_ind)

                                            var obj = {
                                                src: src,
                                                width: width,
                                                height: height,
                                                size: size,
                                            }

                                            $scope.data.vars.page.tmp.all_modules[module_id].items[item_ind].image = src
                                            $scope.data.vars.page.tmp.all_modules[module_id].items[item_ind].imageSize = obj

                                            if ($scope.data.images.uploaded) {
                                                $scope.data.images.uploaded.unshift(imgObj)
                                                // $scope.updateReactLocalStorage(imgObj)
                                            }

                                            //console.log($scope.data.vars.page.tmp.all_modules[module_id].items[item_ind].image)
                                        } else if (section == 'bloggingImg') {
                                            //console.log("in blogging image upload", src)
                                            //console.log($scope.data.posts[$rootScope.blogPostItemId])
                                            $scope.data.posts[$rootScope.blogPostItemId].featured_image_url = src
                                        }
                                    }
                                })
                            },
                            null,
                            function (evt) {
                                ////console.log(JSON.stringify(evt));
                            }
                        )
                    } else {
                        alert('error')
                    }
                    //}
                }
            }

            $scope.bigStockEndPoint = function () {
                // return "http://" + ($scope.data.config.bigstock.test_mode==1?"test":"") + $scope.data.config.bigstock.endpoint + "/2/" + $scope.data.config.bigstock.account_id;
                return (
                    window.location.protocol +
                    '//' +
                    ($scope.data.config.bigstock.test_mode == 1 ? 'test' : '') +
                    $scope.data.config.bigstock.endpoint +
                    '/2/' +
                    $scope.data.config.bigstock.account_id
                )
            }

            $scope.searchBigStockImg = function (fresh) {
                var fresh = typeof fresh == 'undefined' ? true : false,
                    page =
                        typeof $scope.data.images.bigstock != 'undefined' && typeof $scope.data.images.bigstock.paging != 'undefined'
                            ? $scope.data.images.bigstock.paging.page
                            : 0

                var url_to_data = env.settings.is_new_render
                    ? env.settings.laravelApiUrl + 'searchbigstockimg/' + env.settings.website_id + '/' + $scope.data.vars.bigStockSearchKey + '/' + (page + 1)
                    : $scope.data.vars.tsiCmsVars.apiUrl +
                      '?action=WpTsiCmsPublisherApi&command=searchBigStockImg&endpoint=' +
                      $scope.bigStockEndPoint() +
                      '/search' +
                      '&q=' +
                      $scope.data.vars.bigStockSearchKey +
                      '&limit=200&page=' +
                      (page + 1)

                $http({
                    method: 'GET',
                    url: url_to_data, //$scope.data.vars.tsiCmsVars.apiUrl + "?action=WpTsiCmsPublisherApi&command=searchBigStockImg&endpoint=" + $scope.bigStockEndPoint() + "/search" + "&q=" + $scope.data.vars.bigStockSearchKey + "&limit=200&page=" + (page+1)
                }).then(
                    function (success) {
                        if (fresh || typeof $scope.data.images.bigstock == 'undefined' || !$scope.data.images.bigstock) {
                            $scope.data.images.bigstock = success.data.payload ? success.data.payload : {}
                        } else {
                            $scope.data.images.bigstock.url = success.data.payload.url
                            $scope.data.images.bigstock.paging = success.data.payload.paging
                            angular.forEach(success.data.payload.images, function (image) {
                                $scope.data.images.bigstock.images.push(image)
                            })
                        }
                    },
                    function (error) {
                        $log.info(error)
                    }
                )
            }

            $scope.buyBigStockImg = function (section) {
                var size_code =
                    $scope.data.vars.bigStockSelectedImage.formats[
                        $scope.data.vars.bigStockSelectedImage.download_format ? $scope.data.vars.bigStockSelectedImage.download_format : 0
                    ].size_code
                var url_to_data = env.settings.is_new_render
                    ? env.settings.laravelApiUrl +
                      'buybigstockimg/' +
                      env.settings.website_id +
                      '/' +
                      $scope.data.vars.bigStockSelectedImage.id +
                      '/' +
                      size_code +
                      '/' +
                      encodeURI($scope.data.vars.bigStockSelectedImage.description)
                    : $scope.data.vars.tsiCmsVars.apiUrl +
                      '?action=WpTsiCmsPublisherApi&command=buyBigStockImg&endpoint=' +
                      $scope.bigStockEndPoint() +
                      '/' +
                      '&image_id=' +
                      $scope.data.vars.bigStockSelectedImage.id +
                      '&size_code=' +
                      size_code +
                      '&descr=' +
                      encodeURI($scope.data.vars.bigStockSelectedImage.description)

                $http({
                    method: 'GET',
                    url: url_to_data, //$scope.data.vars.tsiCmsVars.apiUrl + "?action=WpTsiCmsPublisherApi&command=buyBigStockImg&endpoint=" + $scope.bigStockEndPoint() + "/" + "&image_id=" + $scope.data.vars.bigStockSelectedImage.id + "&size_code=" + size_code + "&descr=" + encodeURI($scope.data.vars.bigStockSelectedImage.description)
                }).then(
                    function (success) {
                        var response = success.data.payload
                        if (response) {
                            var src = response.src

                            if (section == 'publisher') $scope.setItemImage(src)

                            if (section == 'bloggingImg') $scope.data.posts[$rootScope.blogPostItemId].featured_image_url = src

                            if (typeof response.log != 'undefined') {
                                var format =
                                    $scope.data.vars.bigStockSelectedImage.formats[
                                        $scope.data.vars.bigStockSelectedImage.download_format ? $scope.data.vars.bigStockSelectedImage.download_format : 0
                                    ]

                                // console.log("BigStock Image Src :: " + src);

                                var newImg = {
                                    src: src,
                                    width: format.width,
                                    height: format.height,
                                    parent: 'item',
                                    ext: src.split('.').pop().toLowerCase(),
                                }

                                //close modal in publisher tab and avoid .modal-backdrop still showing when using modal().hide()
                                if ($scope.data.vars.activeTopTab === 'publisher') {
                                    $('#tsi15-image-selector-cancel').trigger('click')
                                    // console.log('TRIGGERED: ', '#tsi15-image-selector-cancel');
                                }

                                $scope.data.images.purchased.unshift(newImg)

                                if (section == 'media') $rootScope.setMediaFilter('folders', 'purchased')
                            }

                            $scope.data.vars.bigStockSelectedImage = null
                        } else if (env.settings.is_new_render && !success.data.ok) {
                            $log.info(success.data.messages)
                        }
                    },
                    function (error) {
                        $log.info(error)
                    }
                )
            }

            $rootScope.bigStockMore = function () {
                // console.log("bigStockMore");

                var showBtn = 0,
                    ele = jQuery('#stock-images .tsi15-bigstock') // Regular BigStock Window in Publisher

                if (ele.length == 0) {
                    ele = jQuery('#stock-images') // BigStock DIV in Media
                    if (ele.length == 0) return
                }

                if (parseInt(ele.attr('scrollTop'), 10) + parseInt(ele.attr('offsetHeight'), 10) >= parseInt(ele.attr('scrollHeight'), 10)) {
                    ////console.log("I am at the bottom :: " + typeof $scope.data.images.bigstock + " :: " + $scope.data.images.bigstock.paging.page + " :: " + $scope.data.images.bigstock.paging.total_pages);
                    showBtn =
                        typeof $scope.data.images.bigstock != 'undefined' &&
                        $scope.data.images.bigstock.paging.page < $scope.data.images.bigstock.paging.total_pages
                            ? 1
                            : 0
                } else {
                    showBtn = 0
                }

                $scope.data.images.bigstock.paging.show = showBtn
            }

            $scope.maintenanceModeChange = function () {
                var confirmMessage =
                    $scope.data.vars.isMaintenanceModeOn === true
                        ? 'Turn on maintenance mode? This will hide access to the site until turned off again.'
                        : 'Turn off maintenance mode? This will allow access to the site.'
                if (confirm(confirmMessage)) {
                    var maintenanceModeStatus = $scope.data.vars.isMaintenanceModeOn ? 3 : 1
                    var url_to_data = env.settings.laravelApiUrl + 'changestatus/' + env.settings.website_id
                    $http({
                        method: 'POST',
                        url: url_to_data,
                        data: { new_status: maintenanceModeStatus },
                    }).then(function (response) {
                        $scope.data.vars.isMaintenanceModeOn = maintenanceModeStatus === 3 ? true : false
                        // add flush cache
                        $scope.flush_cache()
                    })
                }
            }

            //Shutterstock
            $rootScope.ShutterstockMore = function () {
                var showBtn = 0,
                    ele = jQuery('#shutterstock-images .tsi15-shutterstock') // Regular Shutterstock Window in Publisher

                if (ele.length == 0) {
                    ele = jQuery('#shutterstock-images') // Shutterstock DIV in Media
                    if (ele.length == 0) return
                }

                if (parseInt(ele.attr('scrollTop'), 10) + parseInt(ele.attr('offsetHeight'), 10) >= parseInt(ele.attr('scrollHeight'), 10)) {
                    showBtn = typeof $scope.data.images.shutterstock != 'undefined' && $scope.shutterstockPaging !== 0 ? 1 : 0
                    if ($scope.shutterstockWarning) {
                        ele.scrollTop(0)
                        $scope.shutterstockWarning = false
                    }
                } else {
                    showBtn = 0
                }

                $scope.data.images.shutterstock.paging_show = showBtn
            }

            $scope.cancelShutterstockPurchase = function () {
                // console.log('cancelShutterstockPurchase');
                $scope.data.vars.shutterStockSelectedImage = null
                $scope.hideLoadmore = false
            }

            $scope.shutterStockEndPoint = function () {
                return 'https://' + $scope.data.config.shutterstock.endpoint + '/v2/'
            }

            $scope.shutterstockPaging = 0
            $scope.isShutterstockError = 0
            $scope.shutterstockErrorMessage = ''

            $scope.searchShutterStockImg = function (fresh) {
                $scope.shutterstockPaging++
                $scope.hideLoadmore = false
                $scope.isShutterstockError = 0
                $scope.shutterstockErrorMessage = ''
                var fresh = typeof fresh == 'undefined' ? true : false
                var url_to_data = env.settings.is_new_render
                    ? env.settings.laravelApiUrl +
                      'searchshutterstockimg/' +
                      env.settings.website_id +
                      '/' +
                      $scope.data.vars.ShutterStockSearchKey +
                      '/' +
                      $scope.shutterstockPaging
                    : $scope.data.vars.tsiCmsVars.apiUrl +
                      '?action=WpTsiCmsPublisherApi&command=searchShutterStockImg&endpoint=' +
                      $scope.shutterStockEndPoint() +
                      '&q=' +
                      $scope.data.vars.ShutterStockSearchKey +
                      '&page=' +
                      $scope.shutterstockPaging

                $http({
                    method: 'GET',
                    url: url_to_data, //$scope.data.vars.tsiCmsVars.apiUrl + "?action=WpTsiCmsPublisherApi&command=searchBigStockImg&endpoint=" + $scope.bigStockEndPoint() + "/search" + "&q=" + $scope.data.vars.bigStockSearchKey + "&limit=200&page=" + (page+1)
                }).then(
                    function (success) {
                        // console.log("CALLBACK: ", success);
                        if (success.data.payload.error) {
                            $log.info(success.data.payload.message)
                            $scope.isShutterstockError = 1
                            $scope.data.images.shutterstock = {}
                            $scope.shutterstockErrorMessage = success.data.payload.message
                            $scope.shutterstockPaging = 0
                            return
                        }
                        if (success.data.payload.errors && success.data.payload.data) {
                            $scope.shutterstockPaging = 0
                            $log.info(`Errors: ${response.data[0].error},${response.errors[0].message}`)
                            return
                        }
                        if (success.data.payload.warning) {
                            let elmnt = document.getElementById('stock-images')
                            elmnt.scrollTop = 0
                            $scope.isShutterstockError = 1
                            $scope.shutterstockErrorMessage = success.data.payload.message
                            $scope.shutterstockPaging = 0
                            $scope.shutterstockWarning = true
                            // console.log("SHUTTERSTOCK WARNING: ", $scope.data.images.shutterstock)
                        } else if (fresh || typeof $scope.data.images.shutterstock == 'undefined' || !$scope.data.images.shutterstock) {
                            $scope.data.images.shutterstock = {}
                            $scope.data.images.shutterstock = success.data.payload ? success.data.payload : {}
                            // console.log("SHUTTERSTOCK IMAGES SEARCH RESULT: ", success.data.payload.images);
                        } else {
                            $scope.data.images.shutterstock.url = success.data.payload.url
                            $scope.shutterstockPaging = $scope.shutterstockPaging
                            // $scope.data.images.shutterstock_page = success.data.payload.paging;
                            angular.forEach(success.data.payload.images, function (image) {
                                $scope.data.images.shutterstock.images.push(image)
                            })
                            // console.log("SHUTTERSTOCK IMAGES LOAD MORE: ", $scope.data.images.shutterstock.images);
                        }
                    },
                    function (error) {
                        $log.info(error)
                        $scope.isShutterstockError = 1
                        $scope.shutterstockErrorMessage = 'Shutterstock images search failed'
                    }
                )
            }

            $scope.setImageToModal = function (image) {
                $scope.hideLoadmore = true
                $scope.isShutterstockError = 0
                $scope.shutterstockErrorMessage = ''
                var url_to_data = env.settings.is_new_render
                    ? env.settings.laravelApiUrl + 'shutterstockimgdetail/' + env.settings.website_id + '/' + image.id
                    : $scope.data.vars.tsiCmsVars.apiUrl +
                      '?action=WpTsiCmsPublisherApi&command=setImageToModal&endpoint=' +
                      $scope.shutterStockEndPoint() +
                      '&image_id=' +
                      image.id
                $http({
                    method: 'GET',
                    url: url_to_data,
                }).then(
                    function (success) {
                        // console.log("CALLBACK: ", success);
                        var response = success.data.payload
                        if (response.error) {
                            $log.info(response.message)
                            return
                        }
                        if (response.errors && response.data) {
                            $log.info(`Errors: ${response.data[0].error},${response.errors[0].message}`)
                            return
                        }
                        if (response) {
                            $scope.data.vars.shutterStockSelectedImage = response
                            const checkSmall = $scope.data.vars.shutterStockSelectedImage.assets.hasOwnProperty('small_jpg')
                            const checkMed = $scope.data.vars.shutterStockSelectedImage.assets.hasOwnProperty('medium_jpg')
                            $scope.data.vars.shutterStockSelectedImage.download_format = $scope.data.vars.shutterStockSelectedImage.download_format
                                ? $scope.data.vars.shutterStockSelectedImage.download_format
                                : checkSmall
                                ? 'small_jpg'
                                : checkMed
                                ? 'medium_jpg'
                                : 'huge_jpg'
                            // console.log('SELECTED SHUTTERSTOCK IMAGE: ', $scope.data.vars.shutterStockSelectedImage)
                        } else if (env.settings.is_new_render && !success.data.ok) {
                            $log.info(success.data.messages)
                        }
                    },
                    function (error) {
                        $log.info(error)
                        $scope.isShutterstockError = 1
                        $scope.shutterstockErrorMessage = 'Failed setting image to modal'
                    }
                )
            }

            $scope.buyShutterStockImg = function (section) {
                // console.log('buyShutterStockImg');
                $scope.isShutterstockError = 0
                $scope.shutterstockErrorMessage = ''
                var size_code = $scope.data.vars.shutterStockSelectedImage.assets[$scope.data.vars.shutterStockSelectedImage.download_format].display_name
                var url_to_data = env.settings.is_new_render
                    ? env.settings.laravelApiUrl +
                      'shutterstockpurchase/' +
                      env.settings.website_id +
                      '/' +
                      $scope.data.vars.shutterStockSelectedImage.id +
                      '/' +
                      size_code.toLowerCase() +
                      '/' +
                      encodeURI($scope.data.vars.shutterStockSelectedImage.description)
                    : $scope.data.vars.tsiCmsVars.apiUrl +
                      '?action=WpTsiCmsPublisherApi&command=buyShutterStockImg&endpoint=' +
                      $scope.shutterStockEndPoint() +
                      '&image_id=' +
                      $scope.data.vars.shutterStockSelectedImage.id +
                      '&size_code=' +
                      size_code.toLowerCase() +
                      '&descr=' +
                      encodeURI($scope.data.vars.shutterStockSelectedImage.description)

                $http({
                    method: 'GET',
                    url: url_to_data, //$scope.data.vars.tsiCmsVars.apiUrl + "?action=WpTsiCmsPublisherApi&command=buyBigStockImg&endpoint=" + $scope.bigStockEndPoint() + "/" + "&image_id=" + $scope.data.vars.shutterStockSelectedImage.id + "&size_code=" + size_code + "&descr=" + encodeURI($scope.data.vars.shutterStockSelectedImage.description)
                }).then(
                    function (success) {
                        // console.log('CALLBACK: ', success);
                        var response = success.data.payload
                        if (response.error) {
                            $scope.isShutterstockError = 1
                            $log.info(response.message)
                            $scope.shutterstockErrorMessage = response.message
                            return
                        }
                        if (response.errors && response.data) {
                            $scope.isShutterstockError = 1
                            $log.info(`${response.data[0].error},${response.errors[0].message} for ${response.data[0].image_id}`)
                            $scope.shutterstockErrorMessage = `${response.data[0].error},${response.errors[0].message} for ${response.data[0].image_id}`
                            return
                        }
                        if (response) {
                            var src = response.src

                            // console.log('SHUTTERSTOCK IMAGE SOURCE: ', src);
                            // console.log('SHUTTERSTOCK HOST: ', window.location.host);

                            var srcWithoutProtocolAndHost = src

                            if (typeof src !== 'undefined') {
                                srcWithoutProtocolAndHost = src.replace(window.location.protocol + '//' + window.location.host, '')
                            }
                            // console.log('srcWithoutProtocolAndHost: ', srcWithoutProtocolAndHost);

                            if (section == 'publisher') $scope.setItemImage(srcWithoutProtocolAndHost)

                            if (section == 'bloggingImg') $scope.data.posts[$rootScope.blogPostItemId].featured_image_url = srcWithoutProtocolAndHost

                            if (typeof response.log != 'undefined') {
                                var format =
                                    $scope.data.vars.shutterStockSelectedImage.assets[
                                        $scope.data.vars.shutterStockSelectedImage.download_format
                                            ? $scope.data.vars.shutterStockSelectedImage.download_format
                                            : checkSmall
                                            ? 'small_jpg'
                                            : checkMed
                                            ? 'medium_jpg'
                                            : 'huge_jpg'
                                    ]

                                var newImg = {
                                    src: srcWithoutProtocolAndHost,
                                    width: format.width,
                                    height: format.height,
                                    parent: 'item',
                                    ext: srcWithoutProtocolAndHost.split('.').pop().toLowerCase(),
                                }

                                if ($scope.data.images.purchased) {
                                    $scope.data.images.purchased.unshift(newImg)
                                    // console.log('has purchased', $scope.data.images.purchased);
                                } else {
                                    if ($scope.data.images) {
                                        $scope.data.images.purchased = []
                                        $scope.data.images.purchased.push(newImg)
                                        // console.log('has images', $scope.data.images);
                                    } else {
                                        $scope.data.images = {}
                                        $scope.data.images.purchased = []
                                        $scope.data.images.purchased.push(newImg)
                                        // console.log('has data', $scope.data);
                                    }
                                }

                                // console.log('PURCHASED IMAGE: ', $scope.data.vars.shutterStockSelectedImage);
                                // console.log('$scope.data.vars.activeTopTab: ', $scope.data.vars.activeTopTab);
                                // console.log('section: ', section);

                                //close modal in publisher tab and avoid .modal-backdrop still showing when using modal().hide()
                                if ($scope.data.vars.activeTopTab === 'publisher') {
                                    $('#tsi15-image-selector-cancel').trigger('click')
                                    // console.log('TRIGGERED: ', '#tsi15-image-selector-cancel');
                                }

                                if (section == 'media') $rootScope.setMediaFilter('folders', 'purchased')
                            } else {
                                alert('Image already downloaded')
                            }

                            $scope.data.vars.shutterStockSelectedImage = null
                        } else if (env.settings.is_new_render && !success.data.ok) {
                            $log.info(success.data.messages)
                        }
                    },
                    function (error) {
                        $log.info(error)
                        $scope.isShutterstockError = 1
                        $scope.shutterstockErrorMessage = 'licensing failed!'
                    }
                )
            }

            $scope.formFieldChanges = []
            $scope.engageFieldChange = function () {
                $scope.$watch(
                    'data.frms.form.metadata.vcita',
                    function (vcitaNewValue, vcitaOldValue) {
                        if ($scope.data.frms) {
                            if ($scope.data.frms.form.metadata.vcitaLeadInjection) {
                                if (typeof vcitaOldValue !== 'undefined') {
                                    let idx = 0
                                    for (const newValue in vcitaNewValue) {
                                        if (vcitaNewValue[newValue] === null) {
                                            if (!$scope.formFieldChanges.includes(newValue)) {
                                                $scope.formFieldChanges.push(newValue)
                                            }
                                        } else {
                                            if (!$scope.formFieldChanges.includes(newValue)) {
                                                $scope.formFieldChanges.splice(idx, 1)
                                            }
                                        }
                                        idx++
                                    }
                                }
                            }
                        }
                    },
                    true
                )
            }

            $scope.hasEngageAccount = function () {
                if (!$scope.data.engage) {
                    return false
                }
                return $scope.data.engage.hasEngage ? true : false
            }

            $scope.getEngageDashboardLink = function () {
                if ($scope.data.engage && $scope.data.engage.hasEngage) {
                    var loginLink
                    try {
                        $log.log('engage:', $scope.data.engage)
                        if ($scope.data.engage.ssoToken.expires_at < new Date().getTime() / 1000) {
                            alert('Sorry, the link was set to expire after a certain amount of time. Please refresh the page to generate a new access link.')
                        } else {
                            loginLink = window.open($scope.data.engage.loginLink)
                        }
                    } catch (err) {
                        $log.log('err:', err)
                    } finally {
                        if (!loginLink) {
                            $log.log('error:', loginLink)
                        }
                    }
                }
            }

            $rootScope.getActiveForms = function () {
                return typeof $scope.data.frms != 'undefined' ? $scope.data.frms.forms : $scope.data.forms
            }

            $rootScope.onlyActiveForms = function () {
                return function (item) {
                    if (item.is_active == 1 && item.is_trash == 0 && item.id != -1) {
                        return true
                    }
                    return false
                }
            }

            $rootScope.copyToClipboard = function (str, ele) {
                var clipboardText = document.getElementById(typeof ele != 'undefined' ? ele : 'clipboardText')
                clipboardText.value = str
                clipboardText.select()
                document.execCommand('copy')
                alert('Copied to clipboard:\n' + clipboardText.value)
            }

            $rootScope.sanitizeSlug = function (dirtySlug) {
                var cleanedSlug = dirtySlug.replace(/[.,\/#!$%\^&\*;:{}=\_`~()'?\/]/g, '')
                return cleanedSlug.replace(/\s+/g, '-').toLowerCase()
            }

            $rootScope.returnPageData = function () {
                // console.log("returnPageData");
                // return typeof($scope.data.vars)!="undefined" && typeof($scope.data.vars.page)!="undefined" ? angular.copy($scope.data.vars.page.data) : {data:false}
                var data = { data: false }
                if (typeof $scope.data.vars != 'undefined' && typeof $scope.data.vars.page != 'undefined') {
                    $scope.resetExportModules()
                    data = angular.copy($scope.data.vars.page.data)

                    // FIXING POSSIBLE MALFORM DATA
                    var columns = [{}, {}, {}, {}, {}]
                    angular.forEach(data.modules, function (column, column_num) {
                        columns[column_num] = column
                    })
                    data.modules = columns
                }
                return data
            }

            $rootScope.returnPublisherConfig = function () {
                // console.log("returnPublisherConfig")
                return typeof $scope.data.config != 'undefined' && typeof $scope.data.config.publisher != 'undefined'
                    ? {
                          publisher: $scope.data.config.publisher,
                          imgSizes: $rootScope.modules_img_sizes,
                      }
                    : { data: false }
            }

            $rootScope.baseImagesUrl = function (src) {
                let baseUrl =
                    src.indexOf('http') == 0
                        ? src
                        : ($scope.data.vars.tsiCmsVars.previewUrl != '' ? $scope.data.vars.tsiCmsVars.previewUrl : $scope.data.config.website.upload_baseurl) +
                          src
                // console.log("baseUrl: " + baseUrl);
                return baseUrl
            }

            $rootScope.setAvailableForms = function (availableForms) {
                // Force all form IDs to strings.
                $scope.data.forms = (availableForms || []).map((form) => {
                    form.id = '' + form.id
                    return form
                })
            }

            $rootScope.hasUserAccess = function (section) {
                var access = false

                if (typeof $scope.data.vars.user != 'undefined') {
                    var sections_a = ['design', 'logo', 'media', 'forms', 'pages', 'settings', 'templates']
                    var sections_b = ['publisher', 'navigation']
                    var sections_c = ['code', 'vcita_settings']

                    if ($scope.data.vars.is_new_render) {
                        sections_b.push('blogging')
                        // LUNA
                        //
                        // "edit-website-by-client" -- only pagepublisher and navigation and blogging
                        // "edit-website-limited-access" -- all cms - no code
                        // "edit-website-full-access" -- all cms including code

                        if ($scope.data.vars.user.data['edit-website-full-access']) {
                            access = true
                        } else {
                            if ($scope.data.vars.user.data['edit-website-by-client'] && sections_b.includes(section)) {
                                access = true
                            }
                            if ($scope.data.vars.user.data['edit-website-limited-access'] && !sections_c.includes(section)) {
                                access = true
                            }
                        }
                    } else {
                        // WORDPRESS
                        if (sections_a.includes(section) && $scope.data.vars.user.data.block_old_PP == 0) {
                            access = true
                        } else if (sections_c.includes(section) && $scope.data.vars.user.data.blockCustomCode == 0) {
                            access = true
                        } else if (sections_b.includes(section)) {
                            access = true
                        }
                    }
                }

                return access
            }

            $rootScope.hasNewFormBuilderAccess = function () {
                var access = false

                if ($scope.data.vars.user) {
                    if ($scope.data.vars.user.data['edit-website-form-builder-access']) {
                        access = true
                    }
                }

                return access
            }

            $rootScope.isLuna = function () {
                return env.settings.is_new_render
            }

            $rootScope.uploadLogoImg = function (files, cb) {
                if (files && files.length) {
                    for (var i = 0; i < files.length; i++) {
                        var file = files[i]
                        if (!file.$error) {
                            var url_to_data = env.settings.is_new_render
                                ? env.settings.laravelApiUrl + 'uploadlogo/' + env.settings.website_id
                                : $scope.data.vars.tsiCmsVars.apiUrl + '?action=WpTsiCmsLogoApi&command=uploadLogo'

                            Upload.upload({
                                url: url_to_data, //$scope.data.vars.tsiCmsVars.apiUrl + '?action=WpTsiCmsLogoApi&command=uploadLogo',
                                method: 'POST',
                                file: file,
                            }).then(
                                function (resp) {
                                    $timeout(function () {
                                        if (!cb) {
                                            console.log('resp', resp)
                                            var imgObj = resp.data.payload,
                                                attach_id = imgObj.id,
                                                src = imgObj.src,
                                                section = $scope.data.vars.logoSection,
                                                slot = parseInt($scope.data.vars.logoSlot, 10) - 1

                                            if (attach_id && src) {
                                                if (typeof $scope.data.logos.list == 'undefined') {
                                                    $scope.data.logos.list = {}
                                                }
                                                $scope.data.logos.list[attach_id] = src
                                                $scope.setLogo(section, slot < 0 ? 0 : slot, src)
                                                $rootScope.updateIframeLogos()

                                                $scope.data.images.uploaded.unshift(imgObj)
                                            }
                                        } else {
                                            cb(resp)
                                        }
                                    })
                                },
                                null,
                                function (evt) {
                                    //$scope.data.vars.log += "\n" + JSON.stringify(evt)
                                    //var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                                    //$scope.data.vars.log = 'progress: ' + progressPercentage + '% ' + evt.config.data.file.name + '\n' + $scope.data.vars.log;
                                }
                            )
                        } else {
                            alert('error')
                        }
                    }
                }
            }

            // $rootScope.logg = () => {
            //   console.log('Scope data: ', $scope.data);
            //   var {store} = require('~redux/store');
            //   console.log('Store data: ', store.getState());
            // }
        },
    ])
}
