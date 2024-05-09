'use strict';
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
            });
        },
    ]);
    ngModule.controller('mainCtrl', [
        '$rootScope',
        '$scope',
        '$log',
        '$http',
        function ($rootScope, $scope, $log, $http) {
            // console.log("mainCtrl starts")
            //$rootScope.bodyID = 'design'
        },
    ]);
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
        'FeatureFlags',
        function ($rootScope, $scope, $log, $http, $timeout, Upload, env, TsiAuthentication, $state /*, websiteRequest*/, FeatureFlags) {
            // console.log("TsiCmsCtrl starts", env /*,websiteRequest, $rootScope.selectedUrl*/);
            // External alerts from AWS. Loading in setTimeout so UI is loaded first.
            setTimeout(function () {
                var script = document.createElement('script');
                script.src = 'https://production.townsquareinteractive.com/laravel/storage/tsiExternalModal.js';
                var head = document.getElementsByTagName('head')[0];
                head.appendChild(script);
            }, 1000);
            window.onbeforeunload = function (e) {
                if ($scope.isSome2Save) {
                    var dialogText = 'Are you sure you want to leave?\nChanges you made may not be saved.';
                    e.returnValue = dialogText;
                    return dialogText;
                }
            };
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
            };
            $scope.backup = {};
            $rootScope.$watch('website_id_resolved', function (value) {
                if (value === true) {
                    // console.log('website_id_resolved ' + ($rootScope.website_id_resolved ? 'yes' : 'no')); //deferred.resolve(config);
                    $scope.data.vars.is_new_render = env.settings.is_new_render;
                    if (typeof $rootScope.selectedUrl != 'undefined' && $rootScope.selectedUrl != '') {
                        $scope.data.vars.tsiCmsVars.apiUrl = $rootScope.selectedUrl + $scope.data.vars.tsiCmsVars.apiUrlBase;
                        $scope.data.vars.tsiCmsVars.cmsUrl = $rootScope.selectedUrl + $scope.data.vars.tsiCmsVars.cmsUrlBase;
                        $scope.data.vars.tsiCmsVars.previewUrl = 'http://' + $rootScope.selectedUrl;
                    }
                    if (!env.settings.is_new_render || TsiAuthentication.current.cms.user)
                        $scope.setupFeaturedFlags();
                }
            });
            /**
             * Setup featured flags object.
             */
            $scope.setupFeaturedFlags = function () {
                $http({
                    method: 'GET',
                    url: env.settings.laravelApiUrl + 'feature-flags',
                }).then(function (success) {
                    const featureFlagData = success.data.payload || [];
                    featureFlagData.forEach((featureFlag) => {
                        const name = featureFlag.name;
                        if (name in FeatureFlags.object)
                            return; // If name is already handled by the cookie, skip.
                        FeatureFlags.object[name] = featureFlag.value_override || featureFlag.value;
                    });
                    // Move on to the next step.
                    $scope.getUserAndData();
                });
            };
            $scope.getUserAndData = function () {
                var get_user_url = env.settings.is_new_render
                    ? env.settings.laravelApiUrl + 'check-user/' + env.settings.website_id
                    : $scope.data.vars.tsiCmsVars.apiUrl + '?action=WpTsiCmsApi&command=getUser';
                /*
                        var headers = {};
                        var ca = document.cookie.split(';');
                        console.log(ca);
            */
                $http({
                    method: 'GET',
                    url: get_user_url, //$scope.data.vars.tsiCmsVars.apiUrl + "?action=WpTsiCmsApi&command=getUser"
                }).then(function (success) {
                    var response = success.data;
                    if (response.ok) {
                        $scope.data.vars.user = response.payload;
                        if (env.settings.is_new_render) {
                            $scope.data.vars.user.data.ID = TsiAuthentication.current.cms.user.id;
                            $scope.data.vars.user.data.user_login = TsiAuthentication.current.cms.user.login;
                            $scope.data.vars.user.data.user_nicename = TsiAuthentication.current.cms.user.full_name;
                            $scope.data.vars.user.data.user_email = TsiAuthentication.current.cms.user.email;
                            $scope.data.vars.user.data.display_name = TsiAuthentication.current.cms.user.full_name;
                        }
                        $scope.getAllData();
                    }
                    else {
                        alert('Oops! You are not logged in');
                        document.location.href = '/';
                    }
                }, function (error) {
                    // console.log('User Error', error);
                    alert('User Error ' + error.statusText);
                    $scope.data.vars.user = {};
                    if (env.settings.is_new_render) {
                        $state.go('login');
                    }
                });
            };
            $scope.getAllData = function () {
                var get_cms_url = env.settings.is_new_render
                    ? env.settings.laravelApiUrl + 'fulldata/' + env.settings.website_id
                    : $scope.data.vars.tsiCmsVars.apiUrl + '?action=WpTsiCmsApi&command=getCms';
                $http({
                    method: 'GET',
                    url: get_cms_url,
                }).then(function (success) {
                    if (success.data.payload) {
                        angular.forEach(success.data.payload, function (value, key) {
                            $scope.data[key] = angular.copy(value);
                        });
                        $scope.data.design.bkgrds.tab = 'main';
                        if (typeof $scope.data.design.code != 'undefined' && $scope.data.design.code) {
                            $scope.data.design.code.tab = 'css';
                            $scope.data.design.code.visible = 0;
                        }
                        else {
                            $scope.data.design.code = { tab: 'css', visible: 0 };
                        }
                        try {
                            $scope.makeBackup($scope.data);
                            $scope.data.vars.tsiCmsVars.theme = $scope.data.design.themes.selected;
                            $scope.data.vars.tsiCmsVars.themeUrl = $scope.data.vars.tsiCmsVars.themes + $scope.data.vars.tsiCmsVars.theme + '/';
                            if (typeof $rootScope.initLogosData != 'undefined') {
                                $rootScope.initLogosData();
                            }
                            if (typeof $rootScope.setGlobalPubSettings != 'undefined') {
                                $rootScope.setGlobalPubSettings();
                            }
                            $scope.data.vars.user.data.block_old_PP = $rootScope.block_old_PP();
                            $scope.data.vars.isMaintenanceModeOn = $scope.data.config.website.status == 3 ? true : false;
                        }
                        catch (err) {
                            console.log(err);
                        }
                        // Temp featured flag:
                        let params = new URL(document.location).searchParams;
                        $rootScope.showNewMediaToolTab = params.get('nmt') == '1' ? true : false;
                        // Ready to init controller data once all data is set up.
                        $rootScope.controller_ready_to_init = true;
                        switch ($state.current.name) {
                            case 'ui.design':
                                $rootScope.initDesignControllerScopeData();
                                break;
                            case 'ui.templates':
                                $rootScope.initTemplatesControllerScopeData();
                                break;
                            case 'ui.logos':
                                $rootScope.initLogosControllerScopeData();
                                break;
                            case 'ui.codeoverride':
                                $rootScope.initCodeControllerScopeData();
                                break;
                            case 'ui.navigation':
                                $rootScope.initNavigationControllerScopeData();
                                break;
                            case 'ui.publisher':
                                $rootScope.initPublisherControllerScopeData();
                                break;
                            case 'ui.seo':
                                $rootScope.initSeoControllerScopeData();
                                break;
                            case 'ui.media-react':
                                $rootScope.initMediaReactControllerScopeData();
                                break;
                            case 'ui.media-tool':
                                $rootScope.initMediaToolControllerScopeData();
                                break;
                            case 'ui.forms-react':
                                $rootScope.initFormReactControllerScopeData();
                                break;
                            case 'ui.settings':
                                $rootScope.initSettingsControllerScopeData();
                                break;
                            case 'ui.blogging':
                                $rootScope.initBloggingControllerScopeData();
                                break;
                            default:
                                break;
                        }
                        $rootScope.initFormsUIController(); //For Forms React.
                    }
                    else
                        alert('Empty Data');
                }, function (error) {
                    alert('Data Error' + error);
                });
            };
            $scope.makeBackup = function (data, force) {
                // IT MAKES THE OBJECT BACKUPS AFTER FIRST TIME READINGAND AFTER SAVING
                var force = typeof force == 'undefined' ? false : force;
                //console.log("\nMaking Backups\n")
                ////console.log("\n"+JSON.stringify(data)+"\n")
                angular.forEach(['bkgrds', 'code', 'colors', 'fonts', 'themes'], function (key) {
                    if ((typeof data.design != 'undefined' && typeof data.design[key] != 'undefined') || typeof data[key] != 'undefined') {
                        //console.log("Making Backup of " + key)
                        $scope.backup[key] = angular.copy($scope.data.design[key]);
                    }
                });
                // angular.forEach(["logos"], function(key) {
                // 	if (typeof data[key] != "undefined") {
                // 		//console.log("Making Backup of Logos")
                // 		$scope.backup[key] = angular.copy($scope.data[key]);
                // 	}
                // });
                // Set logos as Not Chenged
                // $rootScope.backupLogos()
                // $rootScope.backupFavicon()
                $scope.backup['logos'] = 0;
                $scope.backup['favicon'] = angular.copy($scope.data.config.website.favicon);
                // Pages Backup
                $rootScope.makeBackupPages(data['pages'], force);
                // Global SEO Backup
                if (typeof data['seo'] != 'undefined') {
                    //console.log("Making Global SEO Backup");
                    $scope.backup.seo = angular.copy($scope.data.seo);
                }
                //set forms backups
                if (typeof $rootScope.setFormBackups != 'undefined' && typeof data['forms'] != 'undefined') {
                    $rootScope.setFormBackups(data['forms']);
                }
                // Blog posts backup
                if (typeof data['blogging'] != 'undefined') {
                    //console.log("Making blog categories Backup");
                    $scope.backup.blogging = angular.copy($scope.data.blogging);
                }
                if (typeof data['posts'] != 'undefined') {
                    //console.log("Making blog posts Backup");
                    $scope.backup.posts = angular.copy($scope.data.posts);
                }
            };
            $rootScope.makeBackupPages = function (pages, force) {
                angular.forEach(pages, function (page_data, page_id) {
                    if (force || typeof $scope.data.pages[page_id].backup == 'undefined') {
                        //console.log("Making SEO & Attr Backup of page " + page_id)
                        $scope.data.pages[page_id].backup = {};
                        $scope.data.pages[page_id].backup.seo = angular.copy($scope.data.pages[page_id].seo);
                        $scope.data.pages[page_id].backup.attrs = {
                            title: angular.copy($scope.data.pages[page_id].title),
                            slug: angular.copy($scope.data.pages[page_id].slug),
                            parent: angular.copy($scope.data.pages[page_id].parent),
                            password: angular.copy($scope.data.pages[page_id].password),
                        };
                    }
                    if (typeof $scope.data.pages[page_id].publisher != 'undefined') {
                        //console.log("Making Data Backup of page " + page_id)
                        $scope.data.pages[page_id].backup.data = angular.copy($scope.data.pages[page_id].publisher.data);
                        $scope.data.pages[page_id].preview = angular.copy($scope.data.pages[page_id].publisher.data);
                    }
                });
            };
            $scope.$watch('data.vars.upload.bkgfile', function () {
                if ($scope.data.vars.upload.bkgfile != null) {
                    $scope.data.vars.upload.bkgfiles = [$scope.data.vars.upload.bkgfile];
                }
            });
            $rootScope.uploadBkg = function (files) {
                //console.log(" uploadBkg ")
                if (files && files.length) {
                    for (var i = 0; i < files.length; i++) {
                        var file = files[i];
                        if (!file.$error) {
                            var url_to_data = env.settings.is_new_render
                                ? env.settings.laravelApiUrl + 'uploadbackground/' + env.settings.website_id
                                : $scope.data.vars.tsiCmsVars.apiUrl + '?action=WpTsiCmsDesignBkgrdsApi&command=uploadBkgrds';
                            Upload.upload({
                                url: url_to_data, //$scope.data.vars.tsiCmsVars.apiUrl + '?action=WpTsiCmsDesignBkgrdsApi&command=uploadBkgrds',
                                method: 'POST',
                                file: file,
                            }).then(function (resp) {
                                $timeout(function () {
                                    var imgObj = resp.data.payload, attach_id = imgObj.id, src = imgObj.src;
                                    if (attach_id && src) {
                                        if (!$scope.data.design.bkgrds.list) {
                                            $scope.data.design.bkgrds.list = {};
                                        }
                                        $scope.data.design.bkgrds.list[attach_id] = src;
                                        $scope.setBackground(src, false);
                                        $scope.data.images.uploaded.unshift(imgObj);
                                    }
                                });
                            }, null, function (evt) {
                                ////console.log(JSON.stringify(evt));
                            });
                        }
                        else {
                            alert('error');
                        }
                    }
                }
            };
            $rootScope.setFavicon = function (src, isClick) {
                // console.log("setFavicon: " + src);
                // var isClick = isClick || true,
                // 	section = $scope.data.design.bkgrds.tab;
                $scope.data.config.website.favicon.src = src;
                // $scope.updateIframeBkgrd(section);
                // if (isClick) jQuery("a[data-target='#"+section+"-bkg']").click();
            };
            $rootScope.uploadFavicon = function (files) {
                // console.log(" uploadFavicon ")
                if (files && files.length) {
                    for (var i = 0; i < files.length; i++) {
                        var file = files[i];
                        if (!file.$error) {
                            var url_to_data = env.settings.is_new_render
                                ? env.settings.laravelApiUrl + 'uploadfavicon/' + env.settings.website_id
                                : $scope.data.vars.tsiCmsVars.apiUrl + '?action=WpTsiCmsLogoApi&command=uploadFavicon';
                            Upload.upload({
                                url: url_to_data,
                                method: 'POST',
                                file: file,
                            }).then(function (resp) {
                                $timeout(function () {
                                    // console.log("resp", resp);
                                    var imgObj = resp.data.payload;
                                    if (typeof imgObj.attachment != 'undefined') {
                                        var attach_id = imgObj.attachment.ID;
                                        var src = imgObj.guid;
                                    }
                                    else {
                                        var attach_id = imgObj.id;
                                        var src = imgObj.src;
                                    }
                                    if (attach_id && src) {
                                        if (typeof $scope.data.config.website.favicon.list == 'undefined') {
                                            $scope.data.config.website.favicon.list = {};
                                        }
                                        $scope.data.config.website.favicon.list[attach_id] = src;
                                        $scope.setFavicon(src);
                                        //   $rootScope.updateIframeFavicon();
                                        $scope.data.images.uploaded.unshift(imgObj);
                                    }
                                });
                            }, null, function (evt) {
                                //$scope.data.vars.log += "\n" + JSON.stringify(evt)
                                //var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                                //$scope.data.vars.log = 'progress: ' + progressPercentage + '% ' + evt.config.data.file.name + '\n' + $scope.data.vars.log;
                            });
                        }
                        else {
                            alert('error');
                        }
                    }
                }
            };
            $rootScope.setActiveTopTab = function (activeTopTab) {
                $scope.data.vars.activeTopTab = activeTopTab;
                $rootScope.bodyID = activeTopTab;
                if (activeTopTab == 'design' || activeTopTab == 'logos') {
                    $scope.data.vars.tsi15_window = '500';
                    $scope.data.vars.showSite = true;
                }
                else {
                    $scope.data.vars.tsi15_window = 'full';
                    $scope.data.vars.showSite = false;
                    if (activeTopTab == 'publisher') {
                        $rootScope.bodyID = 'page-editor';
                        if (typeof $rootScope.getPage != 'undefined') {
                            $rootScope.getPage();
                        }
                        else {
                            //console.log("$rootScope.getPage undefined");
                        }
                    }
                }
                if (activeTopTab == 'codeoverride') {
                    $scope.data.design.code.tab = 'css';
                }
                if (activeTopTab == 'navigation') {
                    $rootScope.bodyID = 'navigation-editor';
                }
            };
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
            };
            $scope.getFontsEditor = function () {
                // "Abril Fatface/Abril Fatface;Alegreya Sans SC/Alegreya SC;Arial/Arial;Artifika/Artifika;Arvo/Arvo;Autour One/Autour One;Benchnine/Benchnine;Bevan/Bevan;Bree Serif/Bree Serif;Cantarell/Cantarell;Changa One/Changa One;Dosis/Dosis;Droid Sans/Droid Sans;Droid Serif/Droid Serif;Eater/Eater;Fredoka One/Fredoka One;Georgia/Georgia;Germania One/Germania One;Gorditas/Gorditas;Goudy Bookletter 1911/Sorts Mill Goudy;Great+Vibes/Great Vibes;Helvetica/Helvetica;Josefin Slab/Josefin Slab;Keania One/Keania One;Lato/Lato;Lora/Lora;Lobster/Lobster Two;Merriweather Sans/Merriweather Sans;Muli/Muli;Open Sans/Open Sans;Oswald/Oswald;Overlock/Overlock;Pacifico/Pacifico;Parisienne/Parisienne;Playfair/Playfair Display;Poiret One/Poiret One;Prociono/Prociono;PT Sans Narrow/PT Sans Narrow;Quicksand/Quicksand;Quattrocento/Quattrocento;Racing Sans One/Racing Sans One;Raleway/Raleway;Roboto/Roboto;Rokkitt/Rokkitt;Satisfy/Satisfy;Signika/Signika;Times New Roman/Times New Roman;Ubuntu/Ubuntu;Verdana/Verdana;Yellowtail/Yellowtail",
                var font_names = [];
                angular.forEach($scope.fontsEditor, function (font, key) {
                    font_names.push(font.lbl + '/' + key);
                });
                return font_names.join(';');
            };
            $scope.getCSSEditor = function () {
                // ['http://fonts.googleapis.com/css?family=Abril+Fatface|Alegreya+SC:400,700,400italic,700italic|Artifika|Arvo:400,700,400italic,700italic|Autour+One|BenchNine:400,700|Bevan|Bree+Serif|Cantarell:400,400italic,700,700italic|Changa+One|Dosis:400,700|Droid+Sans:400,700,400italic,700italic|Droid+Serif:400,700,400italic,700italic|Eater|Fredoka+One|Germania+One|Gorditas:700|Sorts+Mill+Goudy:400,400italic|Great+Vibes|Josefin+Slab:400,700,400italic,700italic|Keania+One|Lato:300,400,700,900,300italic,400italic,700italic,900italic|Lora:400,700,400italic,700italic|Lobster+Two:400,700,400italic,700italic|Merriweather+Sans:400,700,400italic,700italic|Muli:300,300italic,400,400italic|Open+Sans:400,700,400italic,700italic|Oswald:400,700|Overlock:400,700,400italic,700italic|Pacifico|Parisienne|Playfair+Display:400,700,400italic,700italic|Poiret+One:400,700,400italic,700italic|Prociono|PT+Sans+Narrow:400,700,400italic,700italic|Quicksand:700|Quattrocento:400,700|Racing+Sans+One|Raleway:400,700|Roboto:400,700,400italic,700italic|Rokkitt:400,700|Satisfy|Signika:400,700|Ubuntu:400,700,400italic,700italic|Yellowtail'],
                var contentsCss = [];
                angular.forEach($scope.fontsEditor, function (font, key) {
                    if (font.google != '') {
                        contentsCss.push(font.google);
                    }
                });
                var retval = '//fonts.googleapis.com/css?family=' + contentsCss.join('|') + '&display=swap';
                return [retval];
            };
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
            };
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
            };
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
            };
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
                font_formats: "Abril Fatface='Abril Fatface';Alegreya Sans='Alegreya Sans';Alegreya Sans SC='Alegreya SC';Arial=Arial;Artifika='Artifika';Arvo='Arvo';Autour One='Autour One';Barlow='Barlow';Barlow Condensed='Barlow Condensed';Benchnine='Benchnine';Bevan='Bevan';Bree Serif='Bree Serif';Cantarell='Cantarell';Changa One='Changa One';Dosis='Dosis';Droid Sans='Droid Sans';Droid Serif='Droid Serif';Eater='Eater';Fredoka One='Fredoka One';Georgia=Georgia;Germania One='Germania One';Gorditas='Gorditas';Sorts Mill Goudy='Sorts Mill Goudy';Goudy Bookletter 1911='Goudy Bookletter 1911';Great+Vibes='Great Vibes';Helvetica=Helvetica;Josefin Sans='Josefin Sans';Josefin Slab='Josefin Slab';Keania One='Keania One';Lato='Lato';Lora='Lora';Lobster='Lobster Two';Merriweather Sans='Merriweather Sans';Muli='Muli';Open Sans='Open Sans';Oswald='Oswald';Overlock='Overlock';Pacifico='Pacifico';Parisienne='Parisienne';Playfair='Playfair Display';Poiret One='Poiret One';Poppins='Poppins';Prociono='Prociono';PT Sans Narrow='PT Sans Narrow';Quicksand='Quicksand';Quattrocento='Quattrocento';Racing Sans One='Racing Sans One';Raleway='Raleway';Roboto='Roboto';Rokkitt='Rokkitt';Satisfy='Satisfy';Signika='Signika';Times New Roman=Times New Roman;Ubuntu='Ubuntu';Verdana=Verdana;Work Sans='Work Sans';Yellowtail='Yellowtail'",
                theme: 'modern',
                content_css: [
                    /* I'll make this dynamic. I have to rework some architectural stuff so this works */
                    '//fonts.googleapis.com/css?family=Abril+Fatface|Alegreya+Sans:400,700,400italic,700italic|Alegreya+SC:400,700,400italic,700italic|Artifika|Arvo:400,700,400italic,700italic|Autour+One|Barlow:400,700,400italic,700italic|Barlow+Condensed:400,700,400italic,700italic|BenchNine:400,700|Bevan|Bree+Serif|Cantarell:400,400italic,700,700italic|Changa+One|Dosis:400,700|Droid+Sans:400,700,400italic,700italic|Droid+Serif:400,700,400italic,700italic|Eater|Fredoka+One|Germania+One|Gorditas:700|Goudy+Bookletter+1911|Sorts+Mill+Goudy:400,400italic|Great+Vibes|Josefin+Sans:400,700,400italic,700italic|Josefin+Slab:400,700,400italic,700italic|Keania+One|Lato:300,400,700,900,300italic,400italic,700italic,900italic|Lora:400,700,400italic,700italic|Lobster+Two:400,700,400italic,700italic|Merriweather+Sans:400,700,400italic,700italic|Muli:300,300italic,400,400italic|Open+Sans:400,700,400italic,700italic|Oswald:400,700|Overlock:400,700,400italic,700italic|Pacifico|Parisienne|Playfair+Display:400,700,400italic,700italic|Poiret+One:400,700,400italic,700italic|Poppins:400,400italic,700,700italic|Prociono|PT+Sans+Narrow:400,700,400italic,700italic|Quicksand:700|Quattrocento:400,700|Racing+Sans+One|Raleway:400,700|Roboto:400,700,400italic,700italic|Rokkitt:400,700|Satisfy|Signika:400,700|Ubuntu:400,700,400italic,700italic|Work+Sans:400,700,400italic,700italic|Yellowtail&display=swap',
                ],
            };
            $rootScope.getFileName = function (url) {
                var filename = typeof url == 'undefined' ? '' : url.split(/(\\|\/)/g).pop();
                return filename.indexOf('HOLDER') > 0 || filename.indexOf('holder') > 0 ? '' : filename;
            };
            $rootScope.getFileAttrs = function (item) {
                var Attrs = '';
                if (typeof item.image == 'undefined' && typeof item.src != 'undefined') {
                    item = {
                        image: item.src,
                        imageSize: {
                            width: item.width,
                            height: item.height,
                            size: item.size,
                        },
                    };
                }
                if (typeof item.image != 'undefined' && item.image != '' && item.image.indexOf('HOLDER') == -1) {
                    Attrs += item.image.split(/(\\|\/)/g).pop();
                    if (typeof item.imageSize != 'undefined' && typeof item.imageSize.size != 'undefined') {
                        Attrs += ' - ' + item.imageSize.width + 'x' + item.imageSize.height;
                        Attrs += ', ' + item.imageSize.size + '';
                    }
                }
                else {
                    Attrs += 'No image data';
                }
                return Attrs;
            };
            $scope.isDirty = function () {
                // do your logic and return 'true' to display the prompt, or 'false' otherwise.
                return true;
            };
            $scope.loadWebSite = function (self) {
                var self = typeof self == 'undefined' ? true : self;
                $scope.data.vars.loadSiteSelfWindow = self;
                //var src = "/?isTsi15=ON&" + Date.now();
                var src = (env.settings.cmsBaseUrl ? env.settings.cmsBaseUrl : '') + '/?isTsi15=ON&' + Date.now();
                if (self) {
                    jQuery('#website').attr('src', src);
                }
                else {
                    var o = $('.tsi15-topbar').first(), l = o.outerWidth(), t = $('#tsi15-navigation').outerHeight(), h = $(document).height(), w = $(document).width() - l - 50;
                    window.$windowScope = $scope;
                    $scope.data.vars.website = window.open(src, 'website', 'outerWidth=' + w + ',outerHeight=' + h + ',0,left=' + l + ',top=' + t + ',status=0,');
                }
                $scope.data.vars.loadSite = 1;
            };
            $scope.unloadWebSite = function () {
                jQuery('#website').attr('src', 'about:blank');
                $scope.data.vars.loadSite = 0;
            };
            $scope.setView = function (view) {
                // https://www.w3schools.com/jsref/prop_frame_contentwindow.asp
                var bodyClass = '', width = $('.tsi15-site-frame').first().width();
                if (view == 'mobile') {
                    bodyClass = 'isMobile';
                    width = 480;
                }
                else if (view == 'tablet') {
                    bodyClass = 'isTablet';
                    width = 768;
                }
                var iframe = jQuery('#website'), website = iframe[0].contentWindow || iframe[0].contentDocument;
                var body = jQuery('body', website.document);
                body.removeClass('isMobile isTablet');
                body.addClass(bodyClass);
                iframe.attr('width', width + 'px');
                if (typeof $scope.data.vars.website != 'undefined') {
                    body = jQuery('body', $scope.data.vars.website.document);
                    body.removeClass('isMobile isTablet');
                    body.addClass(bodyClass);
                    $scope.data.vars.website.resizeTo(width, $(document).height());
                }
                $scope.data.vars.view = view;
            };
            $scope.$on('applyCmsStyles', function (e) {
                $rootScope.applyCmsStyles();
            });
            $rootScope.applyCmsStyles = function () {
                if (typeof $rootScope.updateIframeBkgrd == 'function')
                    $rootScope.updateIframeBkgrd();
                if (typeof $rootScope.updateIframeColors == 'function')
                    $rootScope.updateIframeColors();
                if (typeof $rootScope.updateIframeFonts == 'function')
                    $rootScope.updateIframeFonts();
                if (typeof $rootScope.updateIframeLogos == 'function')
                    $rootScope.updateIframeLogos();
                if (typeof $rootScope.updateIframeCustomCss == 'function')
                    $rootScope.updateIframeCustomCss();
                //if (typeof($rootScope.updateIframeCustomJS)=="function") $rootScope.updateIframeCustomJS();
            };
            $scope.$on('findDblClickedItem', function (e) {
                $rootScope.findDblClickedItem();
            });
            $rootScope.findDblClickedItem = function () {
                var websites = $rootScope.getWebsiteWindows();
                angular.forEach(websites, function (website) {
                    if (typeof website != 'undefined' && typeof website.dblClickedItem != 'undefined') {
                        var info = website.dblClickedItem.split(',');
                        if (info.length == 4) {
                            $scope.data.vars.dblClickedItem = {
                                page: info[0],
                                col: info[1],
                                mod: info[2],
                                item: info[3],
                            };
                            if (typeof $scope.data.pages[$scope.data.vars.dblClickedItem.page] != 'undefined' && typeof $rootScope.getPage != 'undefined') {
                                $rootScope.setPageCurrents($scope.data.vars.dblClickedItem.mod);
                                if (typeof $scope.data.vars.curr_page_id != 'undefined' &&
                                    $scope.data.vars.curr_page_id != $scope.data.vars.dblClickedItem.page) {
                                    var page = $scope.data.pages[$scope.data.vars.dblClickedItem.page];
                                    $rootScope.getPage(page.id, page.url, false);
                                }
                            }
                        }
                    }
                });
            };
            $rootScope.tsi_v3 = function () {
                if (typeof $scope.data.design.themes != 'undefined') {
                    var theme = $scope.data.design.themes.selected;
                    return theme == 'beacon-theme_charlotte' || theme == 'beacon-theme_ignite' || theme == 'beacon-theme_rhinebeck';
                }
                else {
                    return false;
                }
            };
            $rootScope.pageModified = function (page_id) {
                var modified = false;
                if (typeof $scope.data.pages[page_id].publisher == 'object') {
                    // if (
                    //   typeof $scope.data.vars.curr_page_id != 'undefined' &&
                    //   $scope.data.vars.curr_page_id == page_id
                    // ) {
                    //   if (typeof $scope.data.pages[page_id].backup.data != 'undefined') {
                    //     // console.log(angular.equals($scope.data.pages[page_id].publisher.data, $scope.data.pages[page_id].backup.data))
                    //   }
                    // }
                    if ((typeof $scope.data.pages[page_id].backup.data != 'undefined' &&
                        !angular.equals($scope.data.pages[page_id].publisher.data, $scope.data.pages[page_id].backup.data)) ||
                        (typeof $scope.data.pages[page_id].backup.modified != 'undefined' && $scope.data.pages[page_id].backup.modified)) {
                        modified = true;
                    }
                }
                return modified;
            };
            $rootScope.pageSeoModified = function (page_id) {
                var modified = false;
                if (!angular.equals($scope.data.pages[page_id].seo, $scope.data.pages[page_id].backup.seo)) {
                    modified = true;
                }
                return modified;
            };
            $rootScope.getPageAttrs = function (page) {
                var fields = ['title', 'slug', 'parent', 'password'], attrs = {};
                angular.forEach(fields, function (field) {
                    attrs[field] = field == 'title' ? $rootScope.strDecode(page[field]) : page[field];
                    //attrs[field] = page[field];
                });
                return attrs;
            };
            $rootScope.pageAttrModified = function (page_id) {
                var modified = false, attrs = $rootScope.getPageAttrs($scope.data.pages[page_id]);
                if (!angular.equals(attrs, $scope.data.pages[page_id].backup.attrs)) {
                    modified = true;
                }
                return modified;
            };
            $scope.getDataChanges = function () {
                // dalbert: Give listeners a chance to prepare data for this.
                $rootScope.$broadcast('cms.onGetDataChanges');
                // when hitting this save button, sync data from react to angular if the current module is react.
                const { getCurrentFrameworkType, syncScopeDataFromReduxStore, syncScopeDataToReduxStore } = require('~redux/utils/core/angular-redux-connect');
                if (getCurrentFrameworkType() === 'react') {
                    syncScopeDataFromReduxStore($scope.data);
                }
                // Design
                angular.forEach(['bkgrds', 'code', 'colors', 'fonts', 'themes'], function (key) {
                    $scope.data.vars.modified.modules[key].changed = angular.equals($scope.data.design[key], $scope.backup[key]) ? 0 : 1;
                    $scope.data.vars.modified.modules[key].save = $scope.data.vars.modified.modules[key].changed;
                });
                // $scope.data.vars.modified.modules["logos"].changed = angular.equals($scope.data.logos, $scope.backup.logos)?0:1;
                // $scope.data.vars.modified.modules["logos"].save = $scope.data.vars.modified.modules["logos"].changed;
                $scope.data.vars.modified.modules['logos'].changed = $scope.backup['logos'];
                $scope.data.vars.modified.modules['logos'].save = $scope.backup['logos'] == 1;
                $scope.data.vars.modified.modules['favicon'].changed = angular.equals($scope.data.config.website.favicon, $scope.backup['favicon']) ? 0 : 1;
                $scope.data.vars.modified.modules['favicon'].save = $scope.data.vars.modified.modules['favicon'].changed;
                // forcing to save design options in case of theme change in new render
                if ($scope.data.vars.modified.modules['themes'].changed && env.settings.is_new_render) {
                    angular.forEach(['bkgrds', 'colors', 'fonts'], function (key) {
                        $scope.data.vars.modified.modules[key].changed = 1;
                        $scope.data.vars.modified.modules[key].save = 1;
                    });
                }
                // Pages
                $scope.data.vars.modified.pages = {};
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
                        };
                    }
                };
                angular.forEach($scope.data.pages, function (page_data, page_id) {
                    if (typeof $scope.data.vars.pagesToDelete[page_id] == 'undefined') {
                        if ($rootScope.pageModified(page_id)) {
                            checkPagesModifiedObj(page_id);
                            $scope.data.vars.modified.pages[page_id].what.data = 1;
                        }
                        if ($rootScope.pageAttrModified(page_id)) {
                            checkPagesModifiedObj(page_id);
                            $scope.data.vars.modified.pages[page_id].what.attrs = 1;
                        }
                        if ($rootScope.pageSeoModified(page_id)) {
                            checkPagesModifiedObj(page_id);
                            $scope.data.vars.modified.pages[page_id].what.seo = 1;
                        }
                    }
                });
                ////console.log(JSON.stringify($scope.data.vars.modified.pages));
                $scope.data.vars.modified.deletePages = {
                    changed: Object.keys($scope.data.vars.pagesToDelete).length > 0 ? 1 : 0,
                    save: 1,
                };
                $scope.data.vars.modified.deleteMedia = {
                    changed: Object.keys($scope.data.vars.mediaToDelete).length > 0 ? 1 : 0,
                    save: 1,
                };
                // Posts
                $scope.data.vars.modified.deletePosts = {
                    changed: Object.keys($scope.data.vars.postsToDelete).length > 0 ? 1 : 0,
                    save: 1,
                };
                $scope.data.vars.modified.deleteCategories = {
                    changed: Object.keys($scope.data.vars.categoriesToDelete).length > 0 ? 1 : 0,
                    save: 1,
                };
                // Navigation
                $scope.data.vars.modified.navs = {
                    changed: typeof $rootScope.navigationHasUpdates != 'undefined' && $rootScope.navigationHasUpdates() ? 1 : 0,
                    save: 1,
                };
                // 301 Redirects
                $scope.data.vars.modified.redirects = {
                    changed: typeof $rootScope.redirectsHasUpdates != 'undefined' && $rootScope.redirectsHasUpdates() ? 1 : 0,
                    save: 1,
                };
                // Contact
                $scope.data.vars.modified.contact = {
                    changed: typeof $rootScope.contactHasUpdates != 'undefined' && $rootScope.contactHasUpdates() ? 1 : 0,
                    save: 1,
                };
                // Social
                $scope.data.vars.modified.social = {
                    changed: typeof $rootScope.socialHasUpdates != 'undefined' && $rootScope.socialHasUpdates() ? 1 : 0,
                    save: 1,
                };
                // Social
                $scope.data.vars.modified.ga_options = {
                    changed: typeof $rootScope.gaOptionsHasUpdates != 'undefined' && $rootScope.gaOptionsHasUpdates() ? 1 : 0,
                    save: 1,
                };
                // vcita
                $scope.data.vars.modified.vcita = {
                    changed: typeof $rootScope.vcitaHasUpdates != 'undefined' && $rootScope.vcitaHasUpdates() ? 1 : 0,
                    save: 1,
                };
                // vcita business
                $scope.data.vars.modified.vcitaBusiness = {
                    changed: typeof $rootScope.vcitaBusinessHasUpdates != 'undefined' && $rootScope.vcitaBusinessHasUpdates() ? 1 : 0,
                    save: 1,
                };
                // Imgix Base Url
                $scope.data.vars.modified.imgixBaseUrlData = {
                    changed: typeof $rootScope.imgixHasUpdate != 'undefined' && $rootScope.imgixHasUpdate() ? 1 : 0,
                    save: 1,
                };
                // Maintenance
                $scope.data.vars.modified.maintenanceData = {
                    changed: typeof $rootScope.maintenanceHasUpdates != 'undefined' && $rootScope.maintenanceHasUpdates() ? 1 : 0,
                    save: 1,
                };
                // SEO
                $scope.data.vars.modified.seo = {
                    changed: typeof $rootScope.seoHasUpdates != 'undefined' && $rootScope.seoHasUpdates() ? 1 : 0,
                    save: 1,
                };
                // Templates / Footer UI
                $scope.data.vars.modified.composites = {
                    changed: typeof $rootScope.templatesHasUpdates != 'undefined' && $rootScope.templatesHasUpdates() ? 1 : 0,
                    save: 1,
                };
                //Blog Posts - Categories
                $scope.data.vars.modified.blogging = {
                    changed: typeof $rootScope.blogCategoriesHasUpdates != 'undefined' && $rootScope.blogCategoriesHasUpdates() ? 1 : 0,
                    save: 1,
                };
                //Blog Posts - Tags
                $scope.data.vars.modified.tags = {
                    changed: typeof $rootScope.blogTagsHasUpdates != 'undefined' && $rootScope.blogTagsHasUpdates() ? 1 : 0,
                    save: 1,
                };
                $scope.data.vars.modified.posts = {
                    changed: typeof $rootScope.blogPostsHasUpdates != 'undefined' && $rootScope.blogPostsHasUpdates() ? 1 : 0,
                    save: 1,
                };
                // Forms
                if (typeof $rootScope.getModifiedForms != 'undefined') {
                    $scope.data.vars.modified.frms = $rootScope.getModifiedForms();
                    angular.forEach($scope.data.vars.modified.frms, function (frm_data, frm_id) {
                        frm_data.save = 1;
                    });
                }
                // Sync Angularjs back to React:
                syncScopeDataToReduxStore($scope.data);
            };
            $rootScope.initPubCnf = function () {
                $rootScope.modules_types = $scope.data.config.publisher.modules;
                $rootScope.section_layouts = $scope.data.config.publisher.layouts.setup;
            };
            $rootScope.getPublisherCnf = function (theme_id) {
                $log.info('Get publisher configuration');
                var url_to_data = env.settings.is_new_render
                    ? env.settings.laravelApiUrl + 'publisherconfig/' + env.settings.website_id
                    : $scope.data.vars.tsiCmsVars.apiUrl + '?action=WpTsiCmsPublisherApi&command=getCnf&theme=' + theme_id;
                $http({
                    method: 'GET',
                    url: url_to_data,
                }).then(function (success) {
                    var response = success.data;
                    $scope.data.config.publisher = response.payload;
                    $rootScope.initPubCnf();
                    // $scope.initializePageData();
                    // LOOP ALL PAGES ALREADY LOADED AND ADJUST THE MODULE TYPE
                    if (typeof $rootScope.adjustPageToTheme != 'undefined') {
                        angular.forEach($scope.data.pages, function (page_data, page_id) {
                            if (typeof $scope.data.pages[page_id].publisher != 'undefined') {
                                $rootScope.adjustPageToTheme(page_id);
                            }
                        });
                    }
                }, function (error) {
                    $log.info(error);
                });
            };
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
                var retval = false;
                // Check for Global Design
                angular.forEach($scope.data.vars.modified.modules, function (module, key) {
                    if (module.changed == '1') {
                        retval = true;
                    }
                });
                // Check for Pages
                if (!retval) {
                    angular.forEach($scope.data.vars.modified.pages, function (page_data, page_id) {
                        if (!retval && page_data.changed == 1) {
                            retval = true;
                        }
                    });
                }
                // Are there pages to delete
                if (!retval && $scope.data.vars.modified.deletePages.changed == 1) {
                    retval = true;
                }
                // Is there media to delete
                if (!retval && $scope.data.vars.modified.deleteMedia.changed == 1) {
                    retval = true;
                }
                // Check for Navigation
                if (!retval && $scope.data.vars.modified.navs.changed == 1) {
                    retval = true;
                }
                // Check for 301 Redirects
                if (!retval && $scope.data.vars.modified.redirects.changed == 1) {
                    retval = true;
                }
                // Check for Contact
                if (!retval && $scope.data.vars.modified.contact.changed == 1) {
                    retval = true;
                }
                // Check for Social
                if (!retval && $scope.data.vars.modified.social.changed == 1) {
                    retval = true;
                }
                // Check for GA Options
                if (!retval && $scope.data.vars.modified.ga_options.changed == 1) {
                    retval = true;
                }
                // Check for Imgix Base Url
                if (!retval && $scope.data.vars.modified.imgixBaseUrlData.changed == 1) {
                    retval = true;
                }
                // Check for Maintenance
                if (!retval && $scope.data.vars.modified.maintenanceData.changed == 1) {
                    retval = true;
                }
                // Check for SEO
                if (!retval && $scope.data.vars.modified.seo.changed == 1) {
                    retval = true;
                }
                // Check for vcita
                if (!retval && $scope.data.vars.modified.vcita.changed == 1) {
                    retval = true;
                }
                // Check for vcita Business
                if (!retval && $scope.data.vars.modified.vcitaBusiness.changed == 1) {
                    retval = true;
                }
                // Is there posts to delete
                if (!retval && $scope.data.vars.modified.deletePosts.changed == 1) {
                    retval = true;
                }
                // Check for Blog Posts
                if (!retval && $scope.data.vars.modified.blogging.changed == 1) {
                    retval = true;
                }
                // Is there categories to delete
                if (!retval && $scope.data.vars.modified.deleteCategories.changed == 1) {
                    retval = true;
                }
                // Check for Blog Posts
                if (!retval && $scope.data.vars.modified.tags.changed == 1) {
                    retval = true;
                }
                if (!retval && $scope.data.vars.modified.posts.changed == 1) {
                    retval = true;
                }
                // Check for Templates / Footer UI
                if (!retval && $scope.data.vars.modified.composites.changed == 1) {
                    retval = true;
                }
                // Forms
                if (!retval && typeof $rootScope.getModifiedForms != 'undefined') {
                    angular.forEach($scope.data.vars.modified.frms, function (frm_data, frm_id) {
                        retval = true;
                    });
                }
                return retval;
            };
            $scope.save = function () {
                //console.log("Start Saving")
                // if($scope.hasSavingError()){
                //   alert( $scope.getSavingErrorMessage() );
                //   return false;
                // }
                var data = {}, refresh = false;
                // Get selected modules to save
                angular.forEach($scope.data.vars.modified.modules, function (module, key) {
                    if (module.save == '1') {
                        ////console.log(key)
                        if (key == 'logos') {
                            data[key] = $rootScope.getLogoObjectForSaving();
                        }
                        else if (key == 'favicon') {
                            data[key] = $scope.data.config.website.favicon.src;
                        }
                        else {
                            data[key] = $scope.data.design[key];
                        }
                        if (key == 'themes') {
                            refresh = true;
                        }
                    }
                });
                // Get selected modified Pages for saving
                angular.forEach($scope.data.vars.modified.pages, function (page_data, page_id) {
                    if (page_data.save == 1 && typeof $scope.data.pages[page_id] != 'undefined') {
                        if (typeof data['pages'] == 'undefined') {
                            data['pages'] = {};
                        }
                        // FIX ANY SLUGS CHANGED PAGES & SEO
                        data['pages'][page_id] = {
                            data: page_data.what.data == 1 ? $rootScope.encode(angular.copy($scope.data.pages[page_id].publisher.data)) : {},
                            attrs: page_data.what.attrs == 1 ? $rootScope.getPageAttrs($scope.data.pages[page_id]) : {},
                            seo: page_data.what.seo == 1 ? angular.copy($scope.data.pages[page_id].seo) : {},
                        };
                    }
                });
                // Set pages to remove if any
                if ($scope.data.vars.modified.deletePages.changed == 1 && $scope.data.vars.modified.deletePages.save == 1) {
                    //console.log("Remove Pages");
                    data['deletePages'] = $scope.data.vars.pagesToDelete;
                }
                // Set media to remove if any
                if ($scope.data.vars.modified.deleteMedia.changed == 1 && $scope.data.vars.modified.deleteMedia.save == 1) {
                    //console.log("Remove Media");
                    data['deleteMedia'] = $scope.data.vars.mediaToDelete;
                }
                // Get navigation to save
                if (typeof $rootScope.saveNavigation != 'undefined' && $scope.data.vars.modified.navs.save == 1) {
                    //console.log("Navigation")
                    data['navs'] = $rootScope.saveNavigation();
                }
                // Get 301 redirects to save
                if (typeof $rootScope.saveRedirects != 'undefined' && $scope.data.vars.modified.redirects.save == 1) {
                    //console.log("301 redirects")
                    data['redirects'] = $rootScope.saveRedirects();
                }
                // Get contact to save
                if (typeof $rootScope.saveContacts != 'undefined' &&
                    $scope.data.vars.modified.contact.save == 1 &&
                    $scope.data.vars.modified.contact.changed == 1) {
                    //console.log("Contact");
                    data['contact'] = $rootScope.saveContacts();
                }
                // Get social to save
                if (typeof $rootScope.saveSocial != 'undefined' &&
                    $scope.data.vars.modified.social.save == 1 &&
                    $scope.data.vars.modified.social.changed == 1) {
                    //console.log("Social");
                    data['social'] = $rootScope.saveSocial();
                }
                // Get Imgix Base Url to save
                if (typeof $rootScope.saveImgixBaseUrl != 'undefined' &&
                    $scope.data.vars.modified.imgixBaseUrlData.save == 1 &&
                    $scope.data.vars.modified.imgixBaseUrlData.changed == 1) {
                    //console.log("Social");
                    data['imgixBaseUrlData'] = $rootScope.saveImgixBaseUrl();
                }
                // Get maintenance to save
                if (typeof $rootScope.saveMaintenance != 'undefined' &&
                    $scope.data.vars.modified.maintenanceData.save == 1 &&
                    $scope.data.vars.modified.maintenanceData.changed == 1) {
                    //console.log("Social");
                    data['maintenanceData'] = $rootScope.saveMaintenance();
                }
                // Get Vcita to save
                if (typeof $rootScope.saveVcitaSettings != 'undefined' &&
                    $scope.data.vars.modified.vcita.save == 1 &&
                    $scope.data.vars.modified.vcita.changed == 1) {
                    data['vcitaData'] = $rootScope.saveVcitaSettings();
                }
                // Get VcitaBusiness to save
                if (typeof $rootScope.saveVcitaBusinessInfo != 'undefined' &&
                    $scope.data.vars.modified.vcitaBusiness.save == 1 &&
                    $scope.data.vars.modified.vcitaBusiness.changed == 1) {
                    data['vcitaBusinessData'] = $rootScope.saveVcitaBusinessInfo();
                }
                // Get seo to save
                if (typeof $rootScope.saveSEO != 'undefined' && $scope.data.vars.modified.seo.changed == 1 && $scope.data.vars.modified.seo.save == 1) {
                    //console.log("SEO");
                    data['seo'] = $rootScope.saveSEO();
                }
                // Get templates / footer ui to save
                if (typeof $rootScope.saveTemplates != 'undefined' &&
                    $scope.data.vars.modified.composites.changed == 1 &&
                    $scope.data.vars.modified.composites.save == 1) {
                    //console.log("SEO");
                    data['composites'] = $rootScope.saveTemplates();
                }
                // Set posts to remove if any
                if ($scope.data.vars.modified.deletePosts.changed == 1 && $scope.data.vars.modified.deletePosts.save == 1) {
                    //console.log("Remove Media");
                    data['deletePosts'] = $scope.data.vars.postsToDelete;
                }
                // Get blog posts ui to save
                if (typeof $rootScope.saveCategories != 'undefined' &&
                    $scope.data.vars.modified.blogging.changed == 1 &&
                    $scope.data.vars.modified.blogging.save == 1) {
                    //console.log("blog posts - categories");
                    data['categories'] = $rootScope.saveCategories();
                }
                // Set categories to remove if any
                if ($scope.data.vars.modified.deleteCategories.changed == 1 && $scope.data.vars.modified.deleteCategories.save == 1) {
                    //console.log("Remove Media");
                    var arr = [];
                    angular.forEach($scope.data.vars.categoriesToDelete, function (item, value) {
                        arr.push(value);
                    });
                    $scope.data.vars.categoriesToDelete = arr;
                    data['deleteCategories'] = $scope.data.vars.categoriesToDelete;
                }
                // Get blog posts ui to save tags
                if (typeof $rootScope.saveTags != 'undefined' && $scope.data.vars.modified.tags.changed == 1 && $scope.data.vars.modified.tags.save == 1) {
                    //console.log("blog posts - categories");
                    data['tags'] = $rootScope.saveTags();
                }
                // Get blog posts ui to save
                if (typeof $rootScope.saveBlogPosts != 'undefined' &&
                    $scope.data.vars.modified.posts.changed == 1 &&
                    $scope.data.vars.modified.posts.save == 1) {
                    //console.log("blog posts");
                    data['posts'] = $rootScope.saveBlogPosts();
                }
                // Get selected Forms to save
                if (typeof $scope.data.vars.modified.frms != 'undefined') {
                    angular.forEach($scope.data.vars.modified.frms, function (frm, i) {
                        if (frm.save != 1) {
                            return;
                        }
                        // dalbert: New forms data has objectId.
                        if (frm.objectId) {
                            if ($scope.data.forms2.byObjectId[frm.objectId]) {
                                const { confirmations, notifications, ...form } = $scope.data.forms2.byObjectId[frm.objectId];
                                const preparedFormData = {
                                    id: frm.id || -1,
                                    objectId: frm.objectId,
                                    form,
                                    confirmations,
                                    notifications,
                                };
                                data.forms = [].concat(data.forms || [], preparedFormData);
                            }
                        }
                        else {
                            var curForm = 'form_' + frm.id;
                            if ($scope.data.frms && typeof $scope.data.frms.formDataObjects[curForm]) {
                                var saveFormDataObject = {
                                    id: frm.id,
                                    form: $scope.data.frms.formDataObjects[curForm].formData,
                                    confirmations: $scope.data.frms.formDataObjects[curForm].confirmationsData,
                                    notifications: $scope.data.frms.formDataObjects[curForm].notificationsData,
                                };
                                if (typeof data['forms'] == 'undefined') {
                                    data['forms'] = [];
                                }
                                data['forms'].push(saveFormDataObject);
                            }
                        }
                    });
                }
                //check if vcita lead injection option is selected.
                if ($scope.data.frms) {
                    if ($scope.data.frms.form) {
                        if ($scope.data.frms.form.metadata) {
                            if ($scope.data.frms.form.metadata.vcitaLeadInjection) {
                                let vcitaHasEmailField = false;
                                let vcitaHasNameField = false;
                                if ($scope.data.frms.form.metadata.vcita) {
                                    vcitaHasNameField =
                                        $scope.data.frms.form.metadata.vcita.first_name_to_field == '-' ||
                                            $scope.data.frms.form.metadata.vcita.first_name_to_field == '' ||
                                            $scope.data.frms.form.metadata.vcita.first_name_to_field == null
                                            ? false
                                            : true;
                                    vcitaHasEmailField =
                                        $scope.data.frms.form.metadata.vcita.email_to_field == '-' ||
                                            $scope.data.frms.form.metadata.vcita.email_to_field == '' ||
                                            $scope.data.frms.form.metadata.vcita.email_to_field == null
                                            ? false
                                            : true;
                                }
                                if (!vcitaHasEmailField || !vcitaHasNameField) {
                                    alert('Vcita lead injection option is selected. Please make sure firstname and email fields are mapped.');
                                    return false;
                                }
                                if ($scope.formFieldChanges.length > 0) {
                                    alert('Please re-map the following vcita fields: ' + $scope.formFieldChanges.join(','));
                                    return false;
                                }
                            }
                        }
                    }
                }
                if (Object.keys(data).length > 0) {
                    var url_to_data = env.settings.is_new_render
                        ? env.settings.laravelApiUrl + 'savedata/' + env.settings.website_id
                        : $scope.data.vars.tsiCmsVars.apiUrl + '?action=WpTsiCmsApi&command=save';
                    const request = {
                        method: 'POST',
                        url: url_to_data,
                        data: data,
                    };
                    //Adding cms data save to vercel endpoint
                    if (FeatureFlags.object.vercelDataSave) {
                        const requestVercelData = {
                            method: 'POST',
                            url: 'https://cms-routes.vercel.app/pages',
                            data: { pageData: data, allPages: $scope.data.pages, siteConfig: $scope.data.config.website },
                        };
                        $http(requestVercelData).then(function (success) {
                            console.log('vercel post success');
                        });
                    }
                    $http(request)
                        .then(function (success) {
                        var response = success.data.payload;
                        // Handle vcita saving error.
                        if (response && response.vcitaBusinessData && response.vcitaBusinessData.result && response.vcitaBusinessData.result.isError) {
                            var errorBody = response.vcitaBusinessData.result.body;
                            console.error('Saving Error: ' + errorBody);
                            if (errorBody.toLowerCase().includes('no such file')) {
                                alert('Failed to save Vcita business data: Your image was not accepted. Please try a different file.');
                            }
                            else {
                                alert('Error saving Vcita business info!');
                            }
                        }
                        $scope.makeBackup(data, true);
                        if (typeof data.deletePages != 'undefined') {
                            angular.forEach(data['deletePages'], function (i, page_id) {
                                // console.log("Remove from pages " + page_id)
                                delete $scope.data.vars.pagesToDelete[page_id];
                                delete $scope.data.pages[page_id];
                            });
                        }
                        if (response && typeof response.media != 'undefined') {
                            $scope.data.vars.mediaToDelete = {};
                            $scope.data.images.uploaded = response.media.uploaded;
                            $scope.data.images.purchased = response.media.purchased;
                            $rootScope.setImagesUsage();
                        }
                        if (typeof data.deletePosts != 'undefined') {
                            var setNewPostItem = false;
                            var lengthOfDelete = Object.keys($scope.data.vars.postsToDelete).length;
                            var lengthOfPosts = Object.keys($scope.data.posts).length;
                            //console.log("Posts=", data.deletePosts);
                            angular.forEach(data['deletePosts'], function (i, post_id) {
                                if (post_id == $rootScope.blogPostItemId) {
                                    setNewPostItem = true;
                                }
                                delete $scope.data.vars.postsToDelete[post_id];
                                delete $scope.data.posts[post_id];
                            });
                            if (setNewPostItem && lengthOfPosts - lengthOfDelete != 0) {
                                $rootScope.checkIfEmptyPostId(undefined);
                            }
                        }
                        if (typeof data.deleteCategories != 'undefined') {
                            if (response.deleteCategories.categories_blocked) {
                                angular.forEach(response.deleteCategories.categories_blocked, function (item, value) {
                                    angular.forEach($scope.data.vars.categoriesToDelete, function (key, val) {
                                        if (value == key) {
                                            var index = $scope.data.vars.categoriesToDelete.indexOf(key);
                                            $scope.data.vars.categoriesToDelete.splice(index, 1);
                                        }
                                    });
                                });
                                data['deleteCategories'] = $scope.data.vars.categoriesToDelete;
                            }
                            angular.forEach(data['deleteCategories'], function (i, cat_id) {
                                var indexCat = $scope.data.blogging.categories.findIndex((item) => item.id == i);
                                if (indexCat != -1) {
                                    delete $scope.data.vars.categoriesToDelete[i];
                                    $scope.data.blogging.categories.splice(indexCat, 1);
                                }
                                var indexTag = $scope.data.blogging.tags.findIndex((item) => item.id == i);
                                if (indexTag != -1) {
                                    delete $scope.data.vars.categoriesToDelete[i];
                                    $scope.data.blogging.tags.splice(indexTag, 1);
                                }
                            });
                        }
                        if ($scope.data.vars.loadSite == 1 && refresh) {
                            $log.info('Refreshing website');
                            $('#website').attr('src', $('#website').attr('src'));
                        }
                        if (response) {
                            // DM:Forms: Call formsSaveAllDataSync to sync data with forms objects
                            // ie. backups, newId for new forms, new objects, etc...
                            if (typeof $rootScope.formsSaveAllDataSync != 'undefined' && typeof response.forms != 'undefined') {
                                $rootScope.formsSaveAllDataSync(response);
                            }
                            if (env.settings.is_new_render) {
                                if (response.navs) {
                                    //replace temporary menu_item ids with permanent ones
                                    if (response.navs.new_items_map)
                                        $rootScope.replaceNavTempIdsWithReal(response.navs.new_items_map);
                                    if (response.navs.items_removed || response.navs.lists_removed)
                                        $rootScope.resetNavDeleted(response.navs.items_removed, response.navs.lists_removed);
                                    if (response.navs.updated_data) {
                                        $scope.data.navigation = response.navs.updated_data;
                                        $rootScope.reloadNavigation();
                                    }
                                }
                                if (response.posts) {
                                    //replace temporary post ids with permanent ones
                                    if (response.posts.new_items_map) {
                                        $rootScope.replacePostTempIdsWithReal(response.posts.new_items_map);
                                    }
                                    if (response.posts.updated_data) {
                                        $rootScope.replacePostSlugs(response.posts.updated_data);
                                    }
                                }
                                if (response.categories) {
                                    //replace temporary category ids with permanent ones
                                    if (response.categories.new_items_map) {
                                        $rootScope.replaceCategoryTempIdsWithReal(response.categories.new_items_map);
                                    }
                                    if (response.categories.updated_data) {
                                        if (typeof $rootScope.replaceCategorySlugs === 'function') {
                                            $rootScope.replaceCategorySlugs(response.categories.updated_data);
                                        }
                                        if (typeof $rootScope.updatePostsCountsCats === 'function') {
                                            $rootScope.updatePostsCountsCats(response.categories.updated_data);
                                        }
                                        // $rootScope.replaceCategorySlugs(response.categories.updated_data);
                                        // $rootScope.updatePostsCountsCats(response.categories.updated_data);
                                    }
                                }
                                if (response.deleteCategories) {
                                    angular.forEach(response.deleteCategories.categories_blocked, function (value, key) {
                                        var index = response.deleteCategories.updated_data.categories.findIndex((i) => i.id == key);
                                        if (index > -1) {
                                            alert('Cannot delete category ' +
                                                response.deleteCategories.updated_data.categories[index].name +
                                                '.\n\n ' +
                                                'Reason: ' +
                                                JSON.stringify(value));
                                        }
                                    });
                                }
                                if (response.tags) {
                                    //replace temporary category ids with permanent ones
                                    if (response.tags.new_items_map) {
                                        $rootScope.replaceTagTempIdsWithReal(response.tags.new_items_map);
                                    }
                                    if (response.tags.updated_data) {
                                        if (typeof $rootScope.replaceTagSlugs === 'function') {
                                            $rootScope.replaceTagSlugs(response.tags.updated_data);
                                        }
                                        if (typeof $rootScope.updatePostsCountsTags === 'function') {
                                            $rootScope.updatePostsCountsTags(response.tags.updated_data);
                                        }
                                        // $rootScope.replaceTagSlugs(response.tags.updated_data);
                                        // $rootScope.updatePostsCountsTags(response.tags.updated_data);
                                    }
                                }
                                //adding cashe flush
                                // $scope.flush_cache();
                            }
                            else {
                                if (typeof response.navs !== 'undefined' && response.navs.updated_data)
                                    $scope.data.navigation = response.navs.updated_data;
                            }
                        }
                        return response;
                    }, function (error) {
                        alert('Error : ' + error.statusText);
                    })
                        .then(function (response) {
                        if ($scope.data.vars.modified.frms.length > 0) {
                            $scope.data.vars.modified.frms = $scope.data.vars.modified.frms.filter((form) => form.save !== 1);
                        }
                        $rootScope.$broadcast('cms.onSave', { request, response });
                        const { getCurrentFrameworkType, syncScopeDataToReduxStore } = require('~redux/utils/core/angular-redux-connect');
                        // Sync Angularjs back to React:
                        syncScopeDataToReduxStore($scope.data);
                        return response;
                    });
                }
                //console.log("End Saving")
            };
            $rootScope.encode = function (data) {
                if (typeof data.JS != 'undefined') {
                    $scope.data.pages[$scope.data.vars.curr_page_id].title = $rootScope.strEncode($scope.data.pages[$scope.data.vars.curr_page_id].title);
                    data.JS = $rootScope.strEncode(data.JS, false);
                }
                if (typeof data.head_script != 'undefined') {
                    data.head_script = $rootScope.strEncode(data.head_script, false);
                }
                angular.forEach(data.modules, function (modules, column) {
                    angular.forEach(modules, function (module_data, module_id) {
                        angular.forEach(module_data, function (module_value, module_key) {
                            if (module_key != 'items' && typeof module_value == 'string') {
                                data.modules[column][module_id][module_key] = $rootScope.strEncode(module_value);
                            }
                        });
                        angular.forEach(module_data.items, function (item, item_id) {
                            angular.forEach(item, function (value, key) {
                                var string = $rootScope.strEncode(value, key == 'desc' ? false : true);
                                if (key == 'desc') {
                                    string = $rootScope.replaceHTMLforEncode(string);
                                }
                                data.modules[column][module_id].items[item_id][key] = string;
                            });
                        });
                    });
                });
                return data;
            };
            $rootScope.replaceHTMLforEncode = function (string) {
                string = string
                    .replace(/\[rn\]\[t\]\<li\>/gi, '<li>')
                    .replace(/\[t\]/gi, '')
                    .replace(/\<\/li\>\[rn\]/gi, '</li>');
                string = string.replace(/\[rn\]\s*\<(\/*)t(d|h|r)/gi, '<$1t$2').replace(/\[rn\]\s*\<(\/*)(table|thead|tfoot|tbody)/gi, '<$1$2');
                string = string.replace(/\<\/p\>(\[rn\])+\<p\>/gi, '</p><p>').replace(/\<\/p\>\[rn\]/gi, '</p>');
                string = string.replace(/\<br\s*\/\>/gi, '<br>').replace(/\<br\>\[rn\]/gi, '<br>');
                return string;
            };
            $rootScope.encodeCompositeData = function (data) {
                angular.forEach(data, function (property_value, property_name) {
                    if (property_name != 'modules' && typeof property_value == 'string') {
                        data[property_name] = $rootScope.strEncode(property_value);
                    }
                    else {
                        angular.forEach(data.modules, function (module_data, module_id) {
                            if (module_id != 'items' && typeof module_data == 'string') {
                                data.modules[module_id] = $rootScope.strEncode(module_data);
                            }
                            else {
                                angular.forEach(data.modules.items, function (item_data, item_id) {
                                    angular.forEach(item_data, function (value, key) {
                                        var string = $rootScope.strEncode(value, key == 'text' ? false : true);
                                        if (key == 'text') {
                                            string = $rootScope.replaceHTMLforEncode(string);
                                        }
                                        data.modules.items[item_id][key] = string;
                                    });
                                });
                            }
                        });
                    }
                });
                return data;
            };
            $rootScope.strEncode = function (str, newline) {
                if (typeof str == 'string') {
                    var newline = typeof newline == 'undefined' ? true : newline, rn = newline ? '' : '[rn]', tab = newline ? '' : '[t]', replaceWordChars = function (text) {
                        var s = text;
                        // smart single quotes and apostrophe
                        s = s.replace(/[\u2018\u2019\u201A]/g, "'");
                        // smart double quotes
                        s = s.replace(/[\u201C\u201D\u201E\u2033]/g, '"');
                        // line separator
                        s = s.replace(/\u2028/g, rn);
                        // ellipsis
                        s = s.replace(/\u2026/g, '...');
                        // dashes
                        s = s.replace(/[\u2013\u2014]/g, '-');
                        // circumflex
                        s = s.replace(/\u02C6/g, '^');
                        // open angle bracket
                        s = s.replace(/\u2039/g, '<');
                        // close angle bracket
                        s = s.replace(/\u203A/g, '>');
                        // spaces
                        s = s.replace(/[\u02DC\u00A0]/g, ' ');
                        return s;
                    };
                    var str = !str
                        ? ''
                        : replaceWordChars(str)
                            .replace(/'/g, '&#39;')
                            .replace(/\"/g, '&quot;')
                            .replace(/"/g, '&quot;')
                            .replace(/(?:\r\n|\r|\n)/g, rn)
                            .replace(/(?:\t)/g, tab);
                    str = str.replace(/\\\\/g, '&#92;').replace(/\\/g, '&#92;');
                    return str;
                }
                else {
                    return !str ? '' : str;
                }
            };
            $rootScope.strDecode = function (str) {
                if (typeof str == 'string') {
                    var str = !str
                        ? ''
                        : str
                            .replace(/\&\#39;/g, "'")
                            .replace(/\&quot;/g, '"')
                            .replace(/\[rn\]/g, '\r\n')
                            .replace(/\[t]/g, '\t');
                    str = str.replace(/\&#92;/g, '\\');
                    return str;
                }
                else {
                    return !str ? '' : str;
                }
            };
            $scope.cancel = function () {
                if (confirm('Are you sure you want to revert all changes?')) {
                    /*

                */
                }
            };
            $scope.close = function () {
                var iframe = jQuery('iframe#website');
                if (iframe.length != 0) {
                    iframe[0].contentWindow.close();
                    document.cookie = 'isTsi15=; expires=Thu, 01 Jan 1970 00:00:00 UTC';
                }
                document.location.href = '/';
            };
            $rootScope.logout = function () {
                if (env.settings.is_new_render) {
                    TsiAuthentication.logout().then(function () {
                        $state.go('login');
                    });
                }
                else {
                    $http.get($scope.data.vars.tsiCmsVars.apiUrl + '?action=WpTsiCmsApi&command=logOut').then(function (response) {
                        $scope.close();
                    });
                }
            };
            $scope.flush_cache = function () {
                if (env.settings.is_new_render) {
                    var w_endpoint = env.settings.cmsBaseUrl + env.settings.cmsFlushUrl + '?' + Date.now();
                    return $http({
                        method: 'GET',
                        url: w_endpoint,
                    }).then(function (response) {
                        // console.log('flush_cache', response.data);
                    });
                }
            };
            $rootScope.isPlaceHolder = function (name) {
                return !name || name == '' || name.indexOf('placehold') >= 0 ? true : false;
            };
            $rootScope.isHomePage = function (id) {
                return $scope.data.config.website.frontPageId == id;
            };
            $rootScope.setPageForDelete = function (id) {
                if (typeof $scope.data.vars.pagesToDelete[id] == 'undefined') {
                    //console.log("adding: " + id)
                    $scope.data.vars.pagesToDelete[id] = 1;
                }
                else {
                    //console.log("removing: " + id)
                    delete $scope.data.vars.pagesToDelete[id];
                }
                // $rootScope.removeMenuItemFromListByPageId(id); //MOVE THIS TO RIGHT BEFORE SAVING
            };
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
                return typeof $scope.data.vars.pagesToDelete[id] == 'undefined' ? false : true;
            };
            $rootScope.setMediaForDelete = function (ind, id) {
                if (typeof $scope.data.vars.mediaToDelete[id] == 'undefined') {
                    //console.log("adding: " + id)
                    $scope.data.vars.mediaToDelete[id] = ind;
                }
                else {
                    //console.log("removing: " + id)
                    delete $scope.data.vars.mediaToDelete[id];
                }
            };
            $rootScope.isMediaForDelete = function (id) {
                return typeof $scope.data.vars.mediaToDelete[id] == 'undefined' ? false : true;
            };
            $rootScope.setPostForDelete = function (id) {
                if (typeof $scope.data.vars.postsToDelete[id] == 'undefined') {
                    $scope.data.vars.postsToDelete[id] = 1;
                    //angular.forEach($scope.data.posts[id].categories_ids, function(key,value){
                    //
                    //});
                }
                else {
                    delete $scope.data.vars.postsToDelete[id];
                }
            };
            $rootScope.isPostForDelete = function (id) {
                return typeof $scope.data.vars.postsToDelete[id] == 'undefined' ? false : true;
            };
            $rootScope.setCategoryForDelete = function (id) {
                if (typeof $scope.data.vars.categoriesToDelete[id] == 'undefined') {
                    $scope.data.vars.categoriesToDelete[id] = 1;
                }
                else {
                    delete $scope.data.vars.categoriesToDelete[id];
                }
            };
            $rootScope.isCategoryForDelete = function (id) {
                return typeof $scope.data.vars.categoriesToDelete[id] == 'undefined' ? false : true;
            };
            $rootScope.getWebsiteWindows = function () {
                var iframe = jQuery('#website');
                var websites = [];
                if (iframe.length != 0) {
                    websites.push(iframe[0].contentWindow || iframe[0].contentDocument);
                    websites.push($scope.data.vars.website);
                }
                return websites;
            };
            $scope.browsePage = function () {
                var websites = $rootScope.getWebsiteWindows();
                angular.forEach(websites, function (website) {
                    if (typeof website != 'undefined' && website.document) {
                        if (website.document.location.href != 'about:blank') {
                            website.document.location.href = $scope.data.vars.current_page_url + '?isTsi15=ON&' + Date.now();
                        }
                    }
                });
            };
            $scope.reloadWebsite = function () {
                var pageUrl = typeof pageUrl == 'undefined' ? '' : pageUrl, websites = $rootScope.getWebsiteWindows();
                angular.forEach(websites, function (website) {
                    if (typeof website != 'undefined' && website.document) {
                        if (website.document.location.href != 'about:blank') {
                            if (typeof $scope.data.vars.curr_page_id != 'undefined' && typeof $scope.data.pages[$scope.data.vars.curr_page_id] != 'undefined') {
                                var href = ($scope.data.pages[$scope.data.vars.curr_page_id].url + '/?isTsi15=ON&' + Date.now()).replace(/\/\//g, '/');
                                website.document.location.href = href;
                            }
                            else {
                                website.document.location.reload(true);
                            }
                        }
                    }
                });
            };
            $scope.previewChanged = function (page_id) {
                return typeof $scope.data.pages[page_id].publisher == 'object' &&
                    !angular.equals($scope.data.pages[page_id].preview, $scope.data.pages[page_id].publisher.data)
                    ? true
                    : false;
            };
            $scope.compositePreviewChanged = function (composite_id) {
                if ($scope.data.composites_preview) {
                    return !angular.equals($scope.data.composites_preview[composite_id], $scope.data.composites[composite_id]);
                }
                return false;
            };
            $rootScope.refreshWebsite = function () {
                // Get Modified Pages to save preview in the DB
                var pages = {}, composites = {}, savePreview = false;
                angular.forEach($scope.data.pages, function (page_data, page_id) {
                    if ($scope.previewChanged(page_id)) {
                        savePreview = true;
                        pages[page_id] = $rootScope.encode(angular.copy($scope.data.pages[page_id].publisher.data));
                    }
                });
                // console.log($scope.data.composites);
                angular.forEach($scope.data.composites, function (composite_data, composite_id) {
                    if ($scope.compositePreviewChanged(composite_id)) {
                        savePreview = true;
                        composites[composite_id] = $rootScope.encodeCompositeData(angular.copy($scope.data.composites[composite_id]));
                    }
                });
                if (savePreview) {
                    var url_to_data = env.settings.is_new_render
                        ? env.settings.laravelApiUrl + 'savepreview/' + env.settings.website_id
                        : $scope.data.vars.tsiCmsVars.apiUrl + '?action=WpTsiCmsPublisherApi&command=savePreview';
                    $http({
                        method: 'POST',
                        url: url_to_data,
                        data: {
                            code: $scope.data.design.code,
                            pages: pages,
                            composites: composites,
                        },
                    }).then(function (success) {
                        if (env.settings.is_new_render) {
                            if (typeof success.data.payload.pages != 'undefined')
                                ;
                            angular.forEach(success.data.payload.pages, function (page_id) {
                                $scope.data.pages[page_id].preview = angular.copy($scope.data.pages[page_id].publisher.data);
                            });
                            if (typeof success.data.payload.composites != 'undefined')
                                ;
                            angular.forEach(success.data.payload.composites, function (composite_id) {
                                $scope.data.composites_preview[composite_id] = angular.copy($scope.data.composites[composite_id]);
                            });
                        }
                        else {
                            //WP side - do not support preview of composites yet
                            var IDs = success.data.payload;
                            angular.forEach(IDs, function (page_id) {
                                $scope.data.pages[page_id].preview = angular.copy($scope.data.pages[page_id].publisher.data);
                            });
                        }
                        $scope.reloadWebsite();
                    }, function (error) {
                        alert('Error : ' + error.statusText);
                        $scope.reloadWebsite();
                    });
                }
                else {
                    $scope.reloadWebsite();
                }
            };
            $rootScope.block_old_PP = function () {
                var block = 0, isUsrListed = $scope.data.vars.user.data.blockCustomCode == 0;
                if (!isUsrListed) {
                    var theme = $scope.data.design.themes.selected, blocked_themes = {
                        'beacon-theme_charlotte': '',
                        'beacon-theme_ignite': '',
                        'beacon-theme_tsi-v3': '',
                    };
                    if (typeof blocked_themes[theme] != 'undefined') {
                        block = 1;
                    }
                }
                return block;
            };
            $scope.isImageUsed_bkgrds = function (image) {
                var isUsed = false;
                var sections = ['main', 'header', 'footer'];
                for (var s = 0; s < sections.length; s++) {
                    //if (typeof $scope.data.design.bkgrds[sections[s]].src.indexOf(image)) console.log(sections[s], '-', image, "-", $scope.data.design.bkgrds[sections[s]].src, "-", $scope.data.design.bkgrds[sections[s]].src.indexOf(image))
                    if ($scope.data.design.bkgrds[sections[s]].src.indexOf(image) != -1) {
                        isUsed = true;
                        break;
                    }
                }
                return isUsed;
            };
            $scope.isImageUsed_logo = function (image) {
                var isUsed = false;
                var sections = ['header', 'footer', 'mobile'];
                for (var s = 0; s < sections.length; s++) {
                    if (isUsed)
                        break;
                    for (var slot = 0; slot < 3; slot++) {
                        if (typeof $scope.data.logos[sections[s]].slots[slot] != 'undefined' &&
                            typeof $scope.data.logos[sections[s]].slots[slot].image_src != 'undefined' &&
                            $scope.data.logos[sections[s]].slots[slot].image_src.indexOf(image) != -1) {
                            isUsed = true;
                            break;
                        }
                    }
                }
                return isUsed;
            };
            $scope.isImageUsed_publisher = function (image) {
                var isUsed = false;
                return isUsed;
            };
            $rootScope.setImagesUsage = function () {
                // Check who belongs to whom
                var arr = ['uploaded', 'free', 'purchased'];
                arr.forEach(function (section) {
                    angular.forEach($scope.data.images[section], function (image, key) {
                        var isUsed = '';
                        if (isUsed == '')
                            isUsed = $scope.isImageUsed_logo(image.src) ? 'logo' : '';
                        if (isUsed == '')
                            isUsed = $scope.isImageUsed_bkgrds(image.src) ? 'bkgrds' : '';
                        //if (isUsed=="") isUsed = $scope.isImageUsed_publisher(image.src) ? "items" : "";
                        $scope.data.images[section][key].used = isUsed;
                        if (isUsed != '') {
                            return;
                        }
                    });
                });
            };
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
                    var file = files.shift();
                    if (!file.$error) {
                        // console.log("file", file);
                        var url_to_data = env.settings.is_new_render
                            ? env.settings.laravelApiUrl + 'uploadmedia/' + env.settings.website_id
                            : $scope.data.vars.tsiCmsVars.apiUrl + '?action=WpTsiCmsPublisherApi&command=uploadMedia';
                        // console.log("url_to_data", url_to_data, file);
                        Upload.upload({
                            url: url_to_data, //$scope.data.vars.tsiCmsVars.apiUrl + '?action=WpTsiCmsPublisherApi&command=uploadMedia',
                            method: 'POST',
                            file: file,
                        }).then(function (resp) {
                            $timeout(function () {
                                var imgObj = resp.data.payload;
                                $scope.data.vars.media.lastUploaded = imgObj;
                                if (section == 'mediaItem') {
                                    // console.log("Just add to Media uploaded items", imgObj);
                                    if ($scope.data.images.uploaded)
                                        $scope.data.images.uploaded.unshift(imgObj);
                                    if (files.length)
                                        $rootScope.uploadMedia(section, files);
                                }
                                else {
                                    if (section != 'bloggingImg') {
                                        var module_id = $scope.data.vars.page.tmp.curr_mod_id, item_ind = $scope.data.vars.page.tmp.curr_item_ind;
                                    }
                                    var attach_id = imgObj.attach_id, HTTP_HOST = imgObj.HTTP_HOST, width = imgObj.width, height = imgObj.height, size = imgObj.size, src = env.settings.is_new_render && imgObj.src ? imgObj.src : imgObj.guid.split(HTTP_HOST).pop();
                                    //console.log(section + " :: src :: " + src);
                                    if (section == 'addItems') {
                                        // console.log("imgObj", imgObj)
                                        $rootScope.addModuleItem($scope.data.vars.page.tmp.curr_mod_id, imgObj); //
                                        if (files.length)
                                            $rootScope.uploadMedia(section, files);
                                    }
                                    else if (section == 'itemImg') {
                                        //console.log(module_id + ", " + item_ind)
                                        var obj = {
                                            src: src,
                                            width: width,
                                            height: height,
                                            size: size,
                                        };
                                        $scope.data.vars.page.tmp.all_modules[module_id].items[item_ind].image = src;
                                        $scope.data.vars.page.tmp.all_modules[module_id].items[item_ind].imageSize = obj;
                                        if ($scope.data.images.uploaded) {
                                            $scope.data.images.uploaded.unshift(imgObj);
                                            // $scope.updateReactLocalStorage(imgObj)
                                        }
                                        //console.log($scope.data.vars.page.tmp.all_modules[module_id].items[item_ind].image)
                                    }
                                    else if (section == 'bloggingImg') {
                                        //console.log("in blogging image upload", src)
                                        //console.log($scope.data.posts[$rootScope.blogPostItemId])
                                        $scope.data.posts[$rootScope.blogPostItemId].featured_image_url = src;
                                    }
                                }
                            });
                        }, null, function (evt) {
                            ////console.log(JSON.stringify(evt));
                        });
                    }
                    else {
                        alert('error');
                    }
                    //}
                }
            };
            $scope.bigStockEndPoint = function () {
                // return "http://" + ($scope.data.config.bigstock.test_mode==1?"test":"") + $scope.data.config.bigstock.endpoint + "/2/" + $scope.data.config.bigstock.account_id;
                return (window.location.protocol +
                    '//' +
                    ($scope.data.config.bigstock.test_mode == 1 ? 'test' : '') +
                    $scope.data.config.bigstock.endpoint +
                    '/2/' +
                    $scope.data.config.bigstock.account_id);
            };
            $scope.searchBigStockImg = function (fresh) {
                var fresh = typeof fresh == 'undefined' ? true : false, page = typeof $scope.data.images.bigstock != 'undefined' && typeof $scope.data.images.bigstock.paging != 'undefined'
                    ? $scope.data.images.bigstock.paging.page
                    : 0;
                var url_to_data = env.settings.is_new_render
                    ? env.settings.laravelApiUrl + 'searchbigstockimg/' + env.settings.website_id + '/' + $scope.data.vars.bigStockSearchKey + '/' + (page + 1)
                    : $scope.data.vars.tsiCmsVars.apiUrl +
                        '?action=WpTsiCmsPublisherApi&command=searchBigStockImg&endpoint=' +
                        $scope.bigStockEndPoint() +
                        '/search' +
                        '&q=' +
                        $scope.data.vars.bigStockSearchKey +
                        '&limit=200&page=' +
                        (page + 1);
                $http({
                    method: 'GET',
                    url: url_to_data, //$scope.data.vars.tsiCmsVars.apiUrl + "?action=WpTsiCmsPublisherApi&command=searchBigStockImg&endpoint=" + $scope.bigStockEndPoint() + "/search" + "&q=" + $scope.data.vars.bigStockSearchKey + "&limit=200&page=" + (page+1)
                }).then(function (success) {
                    if (fresh || typeof $scope.data.images.bigstock == 'undefined' || !$scope.data.images.bigstock) {
                        $scope.data.images.bigstock = success.data.payload ? success.data.payload : {};
                    }
                    else {
                        $scope.data.images.bigstock.url = success.data.payload.url;
                        $scope.data.images.bigstock.paging = success.data.payload.paging;
                        angular.forEach(success.data.payload.images, function (image) {
                            $scope.data.images.bigstock.images.push(image);
                        });
                    }
                }, function (error) {
                    $log.info(error);
                });
            };
            $scope.buyBigStockImg = function (section) {
                var size_code = $scope.data.vars.bigStockSelectedImage.formats[$scope.data.vars.bigStockSelectedImage.download_format ? $scope.data.vars.bigStockSelectedImage.download_format : 0].size_code;
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
                        encodeURI($scope.data.vars.bigStockSelectedImage.description);
                $http({
                    method: 'GET',
                    url: url_to_data, //$scope.data.vars.tsiCmsVars.apiUrl + "?action=WpTsiCmsPublisherApi&command=buyBigStockImg&endpoint=" + $scope.bigStockEndPoint() + "/" + "&image_id=" + $scope.data.vars.bigStockSelectedImage.id + "&size_code=" + size_code + "&descr=" + encodeURI($scope.data.vars.bigStockSelectedImage.description)
                }).then(function (success) {
                    var response = success.data.payload;
                    if (response) {
                        var src = response.src;
                        if (section == 'publisher')
                            $scope.setItemImage(src);
                        if (section == 'bloggingImg')
                            $scope.data.posts[$rootScope.blogPostItemId].featured_image_url = src;
                        if (typeof response.log != 'undefined') {
                            var format = $scope.data.vars.bigStockSelectedImage.formats[$scope.data.vars.bigStockSelectedImage.download_format ? $scope.data.vars.bigStockSelectedImage.download_format : 0];
                            // console.log("BigStock Image Src :: " + src);
                            var newImg = {
                                src: src,
                                width: format.width,
                                height: format.height,
                                parent: 'item',
                                ext: src.split('.').pop().toLowerCase(),
                            };
                            //close modal in publisher tab and avoid .modal-backdrop still showing when using modal().hide()
                            if ($scope.data.vars.activeTopTab === 'publisher') {
                                $('#tsi15-image-selector-cancel').trigger('click');
                                // console.log('TRIGGERED: ', '#tsi15-image-selector-cancel');
                            }
                            $scope.data.images.purchased.unshift(newImg);
                            if (section == 'media')
                                $rootScope.setMediaFilter('folders', 'purchased');
                        }
                        $scope.data.vars.bigStockSelectedImage = null;
                    }
                    else if (env.settings.is_new_render && !success.data.ok) {
                        $log.info(success.data.messages);
                    }
                }, function (error) {
                    $log.info(error);
                });
            };
            $rootScope.bigStockMore = function () {
                // console.log("bigStockMore");
                var showBtn = 0, ele = jQuery('#stock-images .tsi15-bigstock'); // Regular BigStock Window in Publisher
                if (ele.length == 0) {
                    ele = jQuery('#stock-images'); // BigStock DIV in Media
                    if (ele.length == 0)
                        return;
                }
                if (parseInt(ele.attr('scrollTop'), 10) + parseInt(ele.attr('offsetHeight'), 10) >= parseInt(ele.attr('scrollHeight'), 10)) {
                    ////console.log("I am at the bottom :: " + typeof $scope.data.images.bigstock + " :: " + $scope.data.images.bigstock.paging.page + " :: " + $scope.data.images.bigstock.paging.total_pages);
                    showBtn =
                        typeof $scope.data.images.bigstock != 'undefined' &&
                            $scope.data.images.bigstock.paging.page < $scope.data.images.bigstock.paging.total_pages
                            ? 1
                            : 0;
                }
                else {
                    showBtn = 0;
                }
                $scope.data.images.bigstock.paging.show = showBtn;
            };
            $scope.maintenanceModeChange = function () {
                var confirmMessage = $scope.data.vars.isMaintenanceModeOn === true
                    ? 'Turn on maintenance mode? This will hide access to the site until turned off again.'
                    : 'Turn off maintenance mode? This will allow access to the site.';
                if (confirm(confirmMessage)) {
                    var maintenanceModeStatus = $scope.data.vars.isMaintenanceModeOn ? 3 : 1;
                    var url_to_data = env.settings.laravelApiUrl + 'changestatus/' + env.settings.website_id;
                    $http({
                        method: 'POST',
                        url: url_to_data,
                        data: { new_status: maintenanceModeStatus },
                    }).then(function (response) {
                        $scope.data.vars.isMaintenanceModeOn = maintenanceModeStatus === 3 ? true : false;
                        // add flush cache
                        $scope.flush_cache();
                    });
                }
            };
            //Shutterstock
            $rootScope.ShutterstockMore = function () {
                var showBtn = 0, ele = jQuery('#shutterstock-images .tsi15-shutterstock'); // Regular Shutterstock Window in Publisher
                if (ele.length == 0) {
                    ele = jQuery('#shutterstock-images'); // Shutterstock DIV in Media
                    if (ele.length == 0)
                        return;
                }
                if (parseInt(ele.attr('scrollTop'), 10) + parseInt(ele.attr('offsetHeight'), 10) >= parseInt(ele.attr('scrollHeight'), 10)) {
                    showBtn = typeof $scope.data.images.shutterstock != 'undefined' && $scope.shutterstockPaging !== 0 ? 1 : 0;
                    if ($scope.shutterstockWarning) {
                        ele.scrollTop(0);
                        $scope.shutterstockWarning = false;
                    }
                }
                else {
                    showBtn = 0;
                }
                $scope.data.images.shutterstock.paging_show = showBtn;
            };
            $scope.cancelShutterstockPurchase = function () {
                // console.log('cancelShutterstockPurchase');
                $scope.data.vars.shutterStockSelectedImage = null;
                $scope.hideLoadmore = false;
            };
            $scope.shutterStockEndPoint = function () {
                return 'https://' + $scope.data.config.shutterstock.endpoint + '/v2/';
            };
            $scope.shutterstockPaging = 0;
            $scope.isShutterstockError = 0;
            $scope.shutterstockErrorMessage = '';
            $scope.searchShutterStockImg = function (fresh) {
                $scope.shutterstockPaging++;
                $scope.hideLoadmore = false;
                $scope.isShutterstockError = 0;
                $scope.shutterstockErrorMessage = '';
                var fresh = typeof fresh == 'undefined' ? true : false;
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
                        $scope.shutterstockPaging;
                $http({
                    method: 'GET',
                    url: url_to_data, //$scope.data.vars.tsiCmsVars.apiUrl + "?action=WpTsiCmsPublisherApi&command=searchBigStockImg&endpoint=" + $scope.bigStockEndPoint() + "/search" + "&q=" + $scope.data.vars.bigStockSearchKey + "&limit=200&page=" + (page+1)
                }).then(function (success) {
                    // console.log("CALLBACK: ", success);
                    if (success.data.payload.error) {
                        $log.info(success.data.payload.message);
                        $scope.isShutterstockError = 1;
                        $scope.data.images.shutterstock = {};
                        $scope.shutterstockErrorMessage = success.data.payload.message;
                        $scope.shutterstockPaging = 0;
                        return;
                    }
                    if (success.data.payload.errors && success.data.payload.data) {
                        $scope.shutterstockPaging = 0;
                        $log.info(`Errors: ${response.data[0].error},${response.errors[0].message}`);
                        return;
                    }
                    if (success.data.payload.warning) {
                        let elmnt = document.getElementById('stock-images');
                        elmnt.scrollTop = 0;
                        $scope.isShutterstockError = 1;
                        $scope.shutterstockErrorMessage = success.data.payload.message;
                        $scope.shutterstockPaging = 0;
                        $scope.shutterstockWarning = true;
                        // console.log("SHUTTERSTOCK WARNING: ", $scope.data.images.shutterstock)
                    }
                    else if (fresh || typeof $scope.data.images.shutterstock == 'undefined' || !$scope.data.images.shutterstock) {
                        $scope.data.images.shutterstock = {};
                        $scope.data.images.shutterstock = success.data.payload ? success.data.payload : {};
                        // console.log("SHUTTERSTOCK IMAGES SEARCH RESULT: ", success.data.payload.images);
                    }
                    else {
                        $scope.data.images.shutterstock.url = success.data.payload.url;
                        $scope.shutterstockPaging = $scope.shutterstockPaging;
                        // $scope.data.images.shutterstock_page = success.data.payload.paging;
                        angular.forEach(success.data.payload.images, function (image) {
                            $scope.data.images.shutterstock.images.push(image);
                        });
                        // console.log("SHUTTERSTOCK IMAGES LOAD MORE: ", $scope.data.images.shutterstock.images);
                    }
                }, function (error) {
                    $log.info(error);
                    $scope.isShutterstockError = 1;
                    $scope.shutterstockErrorMessage = 'Shutterstock images search failed';
                });
            };
            $scope.setImageToModal = function (image) {
                $scope.hideLoadmore = true;
                $scope.isShutterstockError = 0;
                $scope.shutterstockErrorMessage = '';
                var url_to_data = env.settings.is_new_render
                    ? env.settings.laravelApiUrl + 'shutterstockimgdetail/' + env.settings.website_id + '/' + image.id
                    : $scope.data.vars.tsiCmsVars.apiUrl +
                        '?action=WpTsiCmsPublisherApi&command=setImageToModal&endpoint=' +
                        $scope.shutterStockEndPoint() +
                        '&image_id=' +
                        image.id;
                $http({
                    method: 'GET',
                    url: url_to_data,
                }).then(function (success) {
                    // console.log("CALLBACK: ", success);
                    var response = success.data.payload;
                    if (response.error) {
                        $log.info(response.message);
                        return;
                    }
                    if (response.errors && response.data) {
                        $log.info(`Errors: ${response.data[0].error},${response.errors[0].message}`);
                        return;
                    }
                    if (response) {
                        $scope.data.vars.shutterStockSelectedImage = response;
                        const checkSmall = $scope.data.vars.shutterStockSelectedImage.assets.hasOwnProperty('small_jpg');
                        const checkMed = $scope.data.vars.shutterStockSelectedImage.assets.hasOwnProperty('medium_jpg');
                        $scope.data.vars.shutterStockSelectedImage.download_format = $scope.data.vars.shutterStockSelectedImage.download_format
                            ? $scope.data.vars.shutterStockSelectedImage.download_format
                            : checkSmall
                                ? 'small_jpg'
                                : checkMed
                                    ? 'medium_jpg'
                                    : 'huge_jpg';
                        // console.log('SELECTED SHUTTERSTOCK IMAGE: ', $scope.data.vars.shutterStockSelectedImage)
                    }
                    else if (env.settings.is_new_render && !success.data.ok) {
                        $log.info(success.data.messages);
                    }
                }, function (error) {
                    $log.info(error);
                    $scope.isShutterstockError = 1;
                    $scope.shutterstockErrorMessage = 'Failed setting image to modal';
                });
            };
            $scope.buyShutterStockImg = function (section) {
                // console.log('buyShutterStockImg');
                $scope.isShutterstockError = 0;
                $scope.shutterstockErrorMessage = '';
                var size_code = $scope.data.vars.shutterStockSelectedImage.assets[$scope.data.vars.shutterStockSelectedImage.download_format].display_name;
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
                        encodeURI($scope.data.vars.shutterStockSelectedImage.description);
                $http({
                    method: 'GET',
                    url: url_to_data, //$scope.data.vars.tsiCmsVars.apiUrl + "?action=WpTsiCmsPublisherApi&command=buyBigStockImg&endpoint=" + $scope.bigStockEndPoint() + "/" + "&image_id=" + $scope.data.vars.shutterStockSelectedImage.id + "&size_code=" + size_code + "&descr=" + encodeURI($scope.data.vars.shutterStockSelectedImage.description)
                }).then(function (success) {
                    // console.log('CALLBACK: ', success);
                    var response = success.data.payload;
                    if (response.error) {
                        $scope.isShutterstockError = 1;
                        $log.info(response.message);
                        $scope.shutterstockErrorMessage = response.message;
                        return;
                    }
                    if (response.errors && response.data) {
                        $scope.isShutterstockError = 1;
                        $log.info(`${response.data[0].error},${response.errors[0].message} for ${response.data[0].image_id}`);
                        $scope.shutterstockErrorMessage = `${response.data[0].error},${response.errors[0].message} for ${response.data[0].image_id}`;
                        return;
                    }
                    if (response) {
                        var src = response.src;
                        // console.log('SHUTTERSTOCK IMAGE SOURCE: ', src);
                        // console.log('SHUTTERSTOCK HOST: ', window.location.host);
                        var srcWithoutProtocolAndHost = src;
                        if (typeof src !== 'undefined') {
                            srcWithoutProtocolAndHost = src.replace(window.location.protocol + '//' + window.location.host, '');
                        }
                        // console.log('srcWithoutProtocolAndHost: ', srcWithoutProtocolAndHost);
                        if (section == 'publisher')
                            $scope.setItemImage(srcWithoutProtocolAndHost);
                        if (section == 'bloggingImg')
                            $scope.data.posts[$rootScope.blogPostItemId].featured_image_url = srcWithoutProtocolAndHost;
                        if (typeof response.log != 'undefined') {
                            var format = $scope.data.vars.shutterStockSelectedImage.assets[$scope.data.vars.shutterStockSelectedImage.download_format
                                ? $scope.data.vars.shutterStockSelectedImage.download_format
                                : checkSmall
                                    ? 'small_jpg'
                                    : checkMed
                                        ? 'medium_jpg'
                                        : 'huge_jpg'];
                            var newImg = {
                                src: srcWithoutProtocolAndHost,
                                width: format.width,
                                height: format.height,
                                parent: 'item',
                                ext: srcWithoutProtocolAndHost.split('.').pop().toLowerCase(),
                            };
                            if ($scope.data.images.purchased) {
                                $scope.data.images.purchased.unshift(newImg);
                                // console.log('has purchased', $scope.data.images.purchased);
                            }
                            else {
                                if ($scope.data.images) {
                                    $scope.data.images.purchased = [];
                                    $scope.data.images.purchased.push(newImg);
                                    // console.log('has images', $scope.data.images);
                                }
                                else {
                                    $scope.data.images = {};
                                    $scope.data.images.purchased = [];
                                    $scope.data.images.purchased.push(newImg);
                                    // console.log('has data', $scope.data);
                                }
                            }
                            // console.log('PURCHASED IMAGE: ', $scope.data.vars.shutterStockSelectedImage);
                            // console.log('$scope.data.vars.activeTopTab: ', $scope.data.vars.activeTopTab);
                            // console.log('section: ', section);
                            //close modal in publisher tab and avoid .modal-backdrop still showing when using modal().hide()
                            if ($scope.data.vars.activeTopTab === 'publisher') {
                                $('#tsi15-image-selector-cancel').trigger('click');
                                // console.log('TRIGGERED: ', '#tsi15-image-selector-cancel');
                            }
                            if (section == 'media')
                                $rootScope.setMediaFilter('folders', 'purchased');
                        }
                        else {
                            alert('Image already downloaded');
                        }
                        $scope.data.vars.shutterStockSelectedImage = null;
                    }
                    else if (env.settings.is_new_render && !success.data.ok) {
                        $log.info(success.data.messages);
                    }
                }, function (error) {
                    $log.info(error);
                    $scope.isShutterstockError = 1;
                    $scope.shutterstockErrorMessage = 'licensing failed!';
                });
            };
            $scope.formFieldChanges = [];
            $scope.engageFieldChange = function () {
                $scope.$watch('data.frms.form.metadata.vcita', function (vcitaNewValue, vcitaOldValue) {
                    if ($scope.data.frms) {
                        if ($scope.data.frms.form.metadata.vcitaLeadInjection) {
                            if (typeof vcitaOldValue !== 'undefined') {
                                let idx = 0;
                                for (const newValue in vcitaNewValue) {
                                    if (vcitaNewValue[newValue] === null) {
                                        if (!$scope.formFieldChanges.includes(newValue)) {
                                            $scope.formFieldChanges.push(newValue);
                                        }
                                    }
                                    else {
                                        if (!$scope.formFieldChanges.includes(newValue)) {
                                            $scope.formFieldChanges.splice(idx, 1);
                                        }
                                    }
                                    idx++;
                                }
                            }
                        }
                    }
                }, true);
            };
            $scope.hasEngageAccount = function () {
                if (!$scope.data.engage) {
                    return false;
                }
                return $scope.data.engage.hasEngage ? true : false;
            };
            $scope.getEngageDashboardLink = function () {
                if ($scope.data.engage && $scope.data.engage.hasEngage) {
                    var loginLink;
                    try {
                        $log.log('engage:', $scope.data.engage);
                        if ($scope.data.engage.ssoToken.expires_at < new Date().getTime() / 1000) {
                            alert('Sorry, the link was set to expire after a certain amount of time. Please refresh the page to generate a new access link.');
                        }
                        else {
                            loginLink = window.open($scope.data.engage.loginLink);
                        }
                    }
                    catch (err) {
                        $log.log('err:', err);
                    }
                    finally {
                        if (!loginLink) {
                            $log.log('error:', loginLink);
                        }
                    }
                }
            };
            $rootScope.getActiveForms = function () {
                return typeof $scope.data.frms != 'undefined' ? $scope.data.frms.forms : $scope.data.forms;
            };
            $rootScope.onlyActiveForms = function () {
                return function (item) {
                    if (item.is_active == 1 && item.is_trash == 0 && item.id != -1) {
                        return true;
                    }
                    return false;
                };
            };
            $rootScope.copyToClipboard = function (str, ele) {
                var clipboardText = document.getElementById(typeof ele != 'undefined' ? ele : 'clipboardText');
                clipboardText.value = str;
                clipboardText.select();
                document.execCommand('copy');
                alert('Copied to clipboard:\n' + clipboardText.value);
            };
            $rootScope.sanitizeSlug = function (dirtySlug) {
                var cleanedSlug = dirtySlug.replace(/[.,\/#!$%\^&\*;:{}=\_`~()'?\/]/g, '');
                return cleanedSlug.replace(/\s+/g, '-').toLowerCase();
            };
            $rootScope.returnPageData = function () {
                // console.log("returnPageData");
                // return typeof($scope.data.vars)!="undefined" && typeof($scope.data.vars.page)!="undefined" ? angular.copy($scope.data.vars.page.data) : {data:false}
                var data = { data: false };
                if (typeof $scope.data.vars != 'undefined' && typeof $scope.data.vars.page != 'undefined') {
                    $scope.resetExportModules();
                    data = angular.copy($scope.data.vars.page.data);
                    // FIXING POSSIBLE MALFORM DATA
                    var columns = [{}, {}, {}, {}, {}];
                    angular.forEach(data.modules, function (column, column_num) {
                        columns[column_num] = column;
                    });
                    data.modules = columns;
                }
                return data;
            };
            $rootScope.returnPublisherConfig = function () {
                // console.log("returnPublisherConfig")
                return typeof $scope.data.config != 'undefined' && typeof $scope.data.config.publisher != 'undefined'
                    ? {
                        publisher: $scope.data.config.publisher,
                        imgSizes: $rootScope.modules_img_sizes,
                    }
                    : { data: false };
            };
            $rootScope.baseImagesUrl = function (src) {
                let baseUrl = src.indexOf('http') == 0
                    ? src
                    : ($scope.data.vars.tsiCmsVars.previewUrl != '' ? $scope.data.vars.tsiCmsVars.previewUrl : $scope.data.config.website.upload_baseurl) +
                        src;
                // console.log("baseUrl: " + baseUrl);
                return baseUrl;
            };
            $rootScope.setAvailableForms = function (availableForms) {
                // Force all form IDs to strings.
                $scope.data.forms = (availableForms || []).map((form) => {
                    form.id = '' + form.id;
                    return form;
                });
            };
            $rootScope.hasUserAccess = function (section) {
                var access = false;
                if (typeof $scope.data.vars.user != 'undefined') {
                    var sections_a = ['design', 'logo', 'media', 'forms', 'pages', 'settings', 'templates'];
                    var sections_b = ['publisher', 'navigation'];
                    var sections_c = ['code', 'vcita_settings'];
                    if ($scope.data.vars.is_new_render) {
                        sections_b.push('blogging');
                        // LUNA
                        //
                        // "edit-website-by-client" -- only pagepublisher and navigation and blogging
                        // "edit-website-limited-access" -- all cms - no code
                        // "edit-website-full-access" -- all cms including code
                        if ($scope.data.vars.user.data['edit-website-full-access']) {
                            access = true;
                        }
                        else {
                            if ($scope.data.vars.user.data['edit-website-by-client'] && sections_b.includes(section)) {
                                access = true;
                            }
                            if ($scope.data.vars.user.data['edit-website-limited-access'] && !sections_c.includes(section)) {
                                access = true;
                            }
                        }
                    }
                    else {
                        // WORDPRESS
                        if (sections_a.includes(section) && $scope.data.vars.user.data.block_old_PP == 0) {
                            access = true;
                        }
                        else if (sections_c.includes(section) && $scope.data.vars.user.data.blockCustomCode == 0) {
                            access = true;
                        }
                        else if (sections_b.includes(section)) {
                            access = true;
                        }
                    }
                }
                return access;
            };
            $rootScope.hasNewFormBuilderAccess = function () {
                var access = false;
                if ($scope.data.vars.user) {
                    if ($scope.data.vars.user.data['edit-website-form-builder-access']) {
                        access = true;
                    }
                }
                return access;
            };
            $rootScope.isLuna = function () {
                return env.settings.is_new_render;
            };
            $rootScope.uploadLogoImg = function (files, cb) {
                if (files && files.length) {
                    for (var i = 0; i < files.length; i++) {
                        var file = files[i];
                        if (!file.$error) {
                            var url_to_data = env.settings.is_new_render
                                ? env.settings.laravelApiUrl + 'uploadlogo/' + env.settings.website_id
                                : $scope.data.vars.tsiCmsVars.apiUrl + '?action=WpTsiCmsLogoApi&command=uploadLogo';
                            Upload.upload({
                                url: url_to_data, //$scope.data.vars.tsiCmsVars.apiUrl + '?action=WpTsiCmsLogoApi&command=uploadLogo',
                                method: 'POST',
                                file: file,
                            }).then(function (resp) {
                                $timeout(function () {
                                    if (!cb) {
                                        console.log('resp', resp);
                                        var imgObj = resp.data.payload, attach_id = imgObj.id, src = imgObj.src, section = $scope.data.vars.logoSection, slot = parseInt($scope.data.vars.logoSlot, 10) - 1;
                                        if (attach_id && src) {
                                            if (typeof $scope.data.logos.list == 'undefined') {
                                                $scope.data.logos.list = {};
                                            }
                                            $scope.data.logos.list[attach_id] = src;
                                            $scope.setLogo(section, slot < 0 ? 0 : slot, src);
                                            $rootScope.updateIframeLogos();
                                            $scope.data.images.uploaded.unshift(imgObj);
                                        }
                                    }
                                    else {
                                        cb(resp);
                                    }
                                });
                            }, null, function (evt) {
                                //$scope.data.vars.log += "\n" + JSON.stringify(evt)
                                //var progressPercentage = parseInt(100.0 * evt.loaded / evt.total);
                                //$scope.data.vars.log = 'progress: ' + progressPercentage + '% ' + evt.config.data.file.name + '\n' + $scope.data.vars.log;
                            });
                        }
                        else {
                            alert('error');
                        }
                    }
                }
            };
            // $rootScope.logg = () => {
            //   console.log('Scope data: ', $scope.data);
            //   var {store} = require('~redux/store');
            //   console.log('Store data: ', store.getState());
            // }
        },
    ]);
};
export {};
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY21zSW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9jbXNJbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUE7QUFFWixNQUFNLENBQUMsT0FBTyxHQUFHLFVBQVUsUUFBUTtJQUMvQixRQUFRLENBQUMsTUFBTSxDQUFDO1FBQ1osZ0JBQWdCO1FBQ2hCLFVBQVUsY0FBYztZQUNwQixxQ0FBcUM7WUFFckMsa0NBQWtDO1lBQ2xDLHFCQUFxQjtZQUNyQixlQUFlO1lBQ2YsZ0JBQWdCO1lBQ2hCLGlEQUFpRDtZQUNqRCx1Q0FBdUM7WUFDdkMsWUFBWTtZQUNaLFNBQVM7WUFDVCxpQkFBaUI7WUFDakIsNEVBQTRFO1lBQzVFLDJEQUEyRDtZQUMzRCw4REFBOEQ7WUFFOUQsb0JBQW9CO1lBQ3BCLGlDQUFpQztZQUNqQyxnQ0FBZ0M7WUFDaEMsaUJBQWlCO1lBQ2pCLGlDQUFpQztZQUNqQyw0QkFBNEI7WUFDNUIsU0FBUztZQUNULGNBQWM7WUFDZCxRQUFRO1lBQ1IsTUFBTTtZQUVOLGNBQWMsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFO2dCQUN2QixxQkFBcUI7Z0JBQ3JCLEdBQUcsRUFBRSxLQUFLO2dCQUNWLEtBQUssRUFBRTtvQkFDSCxFQUFFLEVBQUU7d0JBQ0EsUUFBUSxFQUFFLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQzt3QkFDcEMsVUFBVSxFQUFFLFlBQVk7cUJBQzNCO29CQUNELFdBQVcsRUFBRTt3QkFDVCxRQUFRLEVBQUUsT0FBTyxDQUFDLGVBQWUsQ0FBQztxQkFDckM7b0JBQ0QsVUFBVSxFQUFFO3dCQUNSLFFBQVEsRUFBRSxPQUFPLENBQUMsdUJBQXVCLENBQUM7d0JBQzFDLFVBQVUsRUFBRSxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsUUFBUSxDQUFDO3FCQUMzQztvQkFDRCxTQUFTLEVBQUU7d0JBQ1AsUUFBUSxFQUFFLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQztxQkFDekM7b0JBQ0QsU0FBUyxF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QTREO3dCQUM1RCxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFBO3dCQUN0QyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLENBQUMsR0FBRyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsR0FBRyxDQUFDLENBQUE7d0JBQ3BGLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxLQUFLLEdBQUc7NEJBQ3RDLEtBQUssRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLEtBQUssQ0FBQzs0QkFDckQsSUFBSSxFQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsSUFBSSxDQUFDOzRCQUNuRCxNQUFNLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLENBQUM7NEJBQ3ZELFFBQVEsRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsQ0FBQzt5QkFDOUQsQ0FBQTtvQkFDTCxDQUFDO29CQUNELElBQUksT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxTQUFTLElBQUksV0FBVyxFQUFFLENBQUM7d0JBQzdELHNEQUFzRDt3QkFDdEQsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxDQUFDLElBQUksR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENB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