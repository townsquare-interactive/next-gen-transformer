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
                                url: url_to_data,
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
                forced_root_block: '',
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
                            url: url_to_data,
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
                                url: url_to_data,
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiY21zSW5kZXguanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi9jbXNJbmRleC5qcyJdLCJuYW1lcyI6W10sIm1hcHBpbmdzIjoiQUFBQSxZQUFZLENBQUE7QUFFWixNQUFNLENBQUMsT0FBTyxHQUFHLFVBQVUsUUFBUTtJQUMvQixRQUFRLENBQUMsTUFBTSxDQUFDO1FBQ1osZ0JBQWdCO1FBQ2hCLFVBQVUsY0FBYztZQUNwQixxQ0FBcUM7WUFFckMsa0NBQWtDO1lBQ2xDLHFCQUFxQjtZQUNyQixlQUFlO1lBQ2YsZ0JBQWdCO1lBQ2hCLGlEQUFpRDtZQUNqRCx1Q0FBdUM7WUFDdkMsWUFBWTtZQUNaLFNBQVM7WUFDVCxpQkFBaUI7WUFDakIsNEVBQTRFO1lBQzVFLDJEQUEyRDtZQUMzRCw4REFBOEQ7WUFFOUQsb0JBQW9CO1lBQ3BCLGlDQUFpQztZQUNqQyxnQ0FBZ0M7WUFDaEMsaUJBQWlCO1lBQ2pCLGlDQUFpQztZQUNqQyw0QkFBNEI7WUFDNUIsU0FBUztZQUNULGNBQWM7WUFDZCxRQUFRO1lBQ1IsTUFBTTtZQUVOLGNBQWMsQ0FBQyxLQUFLLENBQUMsSUFBSSxFQUFFO2dCQUN2QixxQkFBcUI7Z0JBQ3JCLEdBQUcsRUFBRSxLQUFLO2dCQUNWLEtBQUssRUFBRTtvQkFDSCxFQUFFLEVBQUU7d0JBQ0EsUUFBUSxFQUFFLE9BQU8sQ0FBQyxpQkFBaUIsQ0FBQzt3QkFDcEMsVUFBVSxFQUFFLFlBQVk7cUJBQzNCO29CQUNELFdBQVcsRUFBRTt3QkFDVCxRQUFRLEVBQUUsT0FBTyxDQUFDLGVBQWUsQ0FBQztxQkFDckM7b0JBQ0QsVUFBVSxFQUFFO3dCQUNSLFFBQVEsRUFBRSxPQUFPLENBQUMsdUJBQXVCLENBQUM7d0JBQzFDLFVBQVUsRUFBRSxPQUFPLENBQUMsU0FBUyxDQUFDLENBQUMsUUFBUSxDQUFDO3FCQUMzQztvQkFDRCxTQUFTLEVBQUU7d0JBQ1AsUUFBUSxFQUFFLE9BQU8sQ0FBQyxtQkFBbUIsQ0FBQztxQkFDekM7b0JBQ0QsU0FBUyxFQUFFO3dCQUNQLFFBQVEsRUFBRSxPQUFPLENBQUMsbUJBQW1CLENBQUM7cUJBQ3pDO2lCQUNKO2FBQ0osQ0FBQyxDQUFBO1FBQ04sQ0FBQztLQUNKLENBQUMsQ0FBQTtJQUVGLFFBQVEsQ0FBQyxVQUFVLENBQUMsVUFBVSxFQUFFO1FBQzVCLFlBQVk7UUFDWixRQUFRO1FBQ1IsTUFBTTtRQUNOLE9BQU87UUFDUCxVQUFVLFVBQVUsRUFBRSxNQUFNLEVBQUUsSUFBSSxFQUFFLEtBQUs7WUFDckMsaUNBQWlDO1lBQ2pDLDhCQUE4QjtRQUNsQyxDQUFDO0tBQ0osQ0FBQyxDQUFBO0lBRUYseUtBQXlLO0lBQ3pLLDREQUE0RDtJQUM1RCxzQ0FBc0M7SUFDdEMsMEZBQTBGO0lBQzFGLHVEQUF1RDtJQUN2RCxTQUFTO0lBQ1QsT0FBTztJQUVQLFFBQVEsQ0FBQyxVQUFVLENBQUMsWUFBWSxFQUFFO1FBQzlCLFlBQVk7UUFDWixRQUFRO1FBQ1IsTUFBTTtRQUNOLE9BQU87UUFDUCxVQUFVO1FBQ1YsUUFBUTtRQUNSLEtBQUs7UUFDTCxtQkFBbUI7UUFDbkIsUUFBUSxDQUFDLDJCQUEyQjtRQUNwQyxjQUFjO1FBQ2QsVUFBVSxVQUFVLEVBQUUsTUFBTSxFQUFFLElBQUksRUFBRSxLQUFLLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxHQUFHLEVBQUUsaUJBQWlCLEVBQUUsTUFBTSxDQUFDLG9CQUFvQixFQUFFLFlBQVk7WUFDMUgscUZBQXFGO1lBRXJGLHlFQUF5RTtZQUN6RSxVQUFVLENBQUM7Z0JBQ1AsSUFBSSxNQUFNLEdBQUcsUUFBUSxDQUFDLGFBQWEsQ0FBQyxRQUFRLENBQUMsQ0FBQTtnQkFDN0MsTUFBTSxDQUFDLEdBQUcsR0FBRyxrRkFBa0YsQ0FBQTtnQkFDL0YsSUFBSSxJQUFJLEdBQUcsUUFBUSxDQUFDLG9CQUFvQixDQUFDLE1BQU0sQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO2dCQUNuRCxJQUFJLENBQUMsV0FBVyxDQUFDLE1BQU0sQ0FBQyxDQUFBO1lBQzVCLENBQUMsRUFBRSxJQUFJLENBQUMsQ0FBQTtZQUVSLE1BQU0sQ0FBQyxjQUFjLEdBQUcsVUFBVSxDQUFDO2dCQUMvQixJQUFJLE1BQU0sQ0FBQyxXQUFXLEVBQUU7b0JBQ3BCLElBQUksVUFBVSxHQUFHLHFFQUFxRSxDQUFBO29CQUN0RixDQUFDLENBQUMsV0FBVyxHQUFHLFVBQVUsQ0FBQTtvQkFDMUIsT0FBTyxVQUFVLENBQUE7aUJBQ3BCO1lBQ0wsQ0FBQyxDQUFBO1lBRUQsTUFBTSxDQUFDLElBQUksR0FBRztnQkFDVixJQUFJLEVBQUU7b0JBQ0YsWUFBWSxFQUFFLFFBQVE7b0JBQ3RCLFlBQVksRUFBRSxLQUFLO29CQUNuQixRQUFRLEVBQUUsSUFBSTtvQkFDZCxRQUFRLEVBQUUsS0FBSztvQkFDZixJQUFJLEVBQUUsU0FBUztvQkFDZixvQkFBb0IsRUFBRSxDQUFDO29CQUN2QixhQUFhLEVBQUUsRUFBRTtvQkFDakIsYUFBYSxFQUFFLEVBQUU7b0JBQ2pCLGFBQWEsRUFBRSxFQUFFO29CQUNqQixrQkFBa0IsRUFBRSxFQUFFO29CQUN0QixhQUFhLEVBQUUsS0FBSztvQkFDcEIsbUJBQW1CLEVBQUUsS0FBSztvQkFDMUIsTUFBTSxFQUFFO3dCQUNKLE9BQU8sRUFBRSxJQUFJO3dCQUNiLFFBQVEsRUFBRSxJQUFJO3FCQUNqQjtvQkFFRCxVQUFVLEVBQUU7d0JBQ1IsS0FBSyxFQUFFLDRCQUE0Qjt3QkFDbkMsTUFBTSxFQUFFLDBCQUEwQjt3QkFDbEMsTUFBTSxFQUFFLHVCQUF1Qjt3QkFDL0IsVUFBVSxFQUFFLEVBQUU7d0JBQ2QsVUFBVSxFQUFFLDBCQUEwQjt3QkFDdEMsVUFBVSxFQUFFLHVCQUF1Qjt3QkFDbkMsTUFBTSxFQUFFLHFCQUFxQjt3QkFDN0IsY0FBYyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsY0FBYyxFQUFFLGtCQUFrQjtxQkFDbEU7b0JBRUQsUUFBUSxFQUFFO3dCQUNOLE9BQU8sRUFBRTs0QkFDTCxNQUFNLEVBQUUsRUFBRSxHQUFHLEVBQUUsYUFBYSxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRTs0QkFDbkQsTUFBTSxFQUFFLEVBQUUsR0FBRyxFQUFFLFFBQVEsRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUU7NEJBQzlDLEtBQUssRUFBRSxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFOzRCQUM1QyxNQUFNLEVBQUUsRUFBRSxHQUFHLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRTs0QkFDOUMsSUFBSSxFQUFFLEVBQUUsR0FBRyxFQUFFLGFBQWEsRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLElBQUksRUFBRSxDQUFDLEVBQUU7NEJBQ2pELEtBQUssRUFBRSxFQUFFLEdBQUcsRUFBRSxPQUFPLEVBQUUsT0FBTyxFQUFFLENBQUMsRUFBRSxJQUFJLEVBQUUsQ0FBQyxFQUFFOzRCQUM1QyxPQUFPLEVBQUUsRUFBRSxHQUFHLEVBQUUsU0FBUyxFQUFFLE9BQU8sRUFBRSxDQUFDLEVBQUUsSUFBSSxFQUFFLENBQUMsRUFBRTt5QkFDbkQ7d0JBQ0QsS0FBSyxFQUFFLEVBQUU7d0JBQ1QsV0FBVyxFQUFFLEVBQUU7d0JBQ2YsV0FBVyxFQUFFLEVBQUU7d0JBQ2YsSUFBSSxFQUFFLEVBQUU7d0JBQ1IsT0FBTyxFQUFFLEVBQUU7d0JBQ1gsTUFBTSxFQUFFLEVBQUU7d0JBQ1YsVUFBVSxFQUFFLEVBQUU7d0JBQ2QsZUFBZSxFQUFFLEVBQUU7d0JBQ25CLEtBQUssRUFBRSxFQUFFO3dCQUNULGFBQWEsRUFBRSxFQUFFO3dCQUNqQixJQUFJLEVBQUUsRUFBRTt3QkFDUixHQUFHLEVBQUUsRUFBRTt3QkFDUCxVQUFVLEVBQUUsRUFBRTt3QkFDZCxTQUFTLEVBQUUsRUFBRTt3QkFDYixRQUFRLEVBQUUsRUFBRTt3QkFDWixJQUFJLEVBQUUsRUFBRTt3QkFDUixLQUFLLEVBQUUsRUFBRTt3QkFDVCxXQUFXLEVBQUUsRUFBRTt3QkFDZixnQkFBZ0IsRUFBRSxFQUFFO3dCQUNwQixnQkFBZ0IsRUFBRSxFQUFFO3FCQUN2QjtpQkFDSjtnQkFFRCxNQUFNLEVBQUUsRUFBRSxVQUFVLEVBQUUsRUFBRSxFQUFFLGVBQWUsRUFBRSxFQUFFLEVBQUU7YUFDbEQsQ0FBQTtZQUVELE1BQU0sQ0FBQyxNQUFNLEdBQUcsRUFBRSxDQUFBO1lBRWxCLFVBQVUsQ0FBQyxNQUFNLENBQUMscUJBQXFCLEVBQUUsVUFBVSxLQUFLO2dCQUNwRCxJQUFJLEtBQUssS0FBSyxJQUFJLEVBQUU7b0JBQ2hCLHFIQUFxSDtvQkFDckgsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsYUFBYSxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUMsYUFBYSxDQUFBO29CQUMzRCxJQUFJLE9BQU8sVUFBVSxDQUFDLFdBQVcsSUFBSSxXQUFXLElBQUksVUFBVSxDQUFDLFdBQVcsSUFBSSxFQUFFLEVBQUU7d0JBQzlFLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEdBQUcsVUFBVSxDQUFDLFdBQVcsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsVUFBVSxDQUFBO3dCQUNwRyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxHQUFHLFVBQVUsQ0FBQyxXQUFXLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFVBQVUsQ0FBQTt3QkFDcEcsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFVBQVUsR0FBRyxTQUFTLEdBQUcsVUFBVSxDQUFDLFdBQVcsQ0FBQTtxQkFDOUU7b0JBQ0QsSUFBSSxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsYUFBYSxJQUFJLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSTt3QkFBRSxNQUFNLENBQUMsa0JBQWtCLEVBQUUsQ0FBQTtpQkFDckc7WUFDTCxDQUFDLENBQUMsQ0FBQTtZQUVGOztlQUVHO1lBQ0gsTUFBTSxDQUFDLGtCQUFrQixHQUFHO2dCQUN4QixLQUFLLENBQUM7b0JBQ0YsTUFBTSxFQUFFLEtBQUs7b0JBQ2IsR0FBRyxFQUFFLEdBQUcsQ0FBQyxRQUFRLENBQUMsYUFBYSxHQUFHLGVBQWU7aUJBQ3BELENBQUMsQ0FBQyxJQUFJLENBQUMsVUFBVSxPQUFPO29CQUNyQixNQUFNLGVBQWUsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sSUFBSSxFQUFFLENBQUE7b0JBQ2xELGVBQWUsQ0FBQyxPQUFPLENBQUMsQ0FBQyxXQUFXLEVBQUUsRUFBRTt3QkFDcEMsTUFBTSxJQUFJLEdBQUcsV0FBVyxDQUFDLElBQUksQ0FBQTt3QkFDN0IsSUFBSSxJQUFJLElBQUksWUFBWSxDQUFDLE1BQU07NEJBQUUsT0FBTSxDQUFDLGtEQUFrRDt3QkFDMUYsWUFBWSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsR0FBRyxXQUFXLENBQUMsY0FBYyxJQUFJLFdBQVcsQ0FBQyxLQUFLLENBQUE7b0JBQy9FLENBQUMsQ0FBQyxDQUFBO29CQUNGLDRCQUE0QjtvQkFDNUIsTUFBTSxDQUFDLGNBQWMsRUFBRSxDQUFBO2dCQUMzQixDQUFDLENBQUMsQ0FBQTtZQUNOLENBQUMsQ0FBQTtZQUVELE1BQU0sQ0FBQyxjQUFjLEdBQUc7Z0JBQ3BCLElBQUksWUFBWSxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUMsYUFBYTtvQkFDekMsQ0FBQyxDQUFDLEdBQUcsQ0FBQyxRQUFRLENBQUMsYUFBYSxHQUFHLGFBQWEsR0FBRyxHQUFHLENBQUMsUUFBUSxDQUFDLFVBQVU7b0JBQ3RFLENBQUMsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxHQUFHLHFDQUFxQyxDQUFBO2dCQUVoRjs7OztjQUlYO2dCQUNXLEtBQUssQ0FBQztvQkFDRixNQUFNLEVBQUUsS0FBSztvQkFDYixHQUFHLEVBQUUsWUFBWSxFQUFFLDRFQUE0RTtpQkFDbEcsQ0FBQyxDQUFDLElBQUksQ0FDSCxVQUFVLE9BQU87b0JBQ2IsSUFBSSxRQUFRLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQTtvQkFFM0IsSUFBSSxRQUFRLENBQUMsRUFBRSxFQUFFO3dCQUNiLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyxRQUFRLENBQUMsT0FBTyxDQUFBO3dCQUN4QyxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsYUFBYSxFQUFFOzRCQUM1QixNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLEVBQUUsR0FBRyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxFQUFFLENBQUE7NEJBQ3JFLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxHQUFHLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQTs0QkFDaEYsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxhQUFhLEdBQUcsaUJBQWlCLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxJQUFJLENBQUMsU0FBUyxDQUFBOzRCQUN2RixNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsR0FBRyxpQkFBaUIsQ0FBQyxPQUFPLENBQUMsR0FBRyxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUE7NEJBQ2hGLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsWUFBWSxHQUFHLGlCQUFpQixDQUFDLE9BQU8sQ0FBQyxHQUFHLENBQUMsSUFBSSxDQUFDLFNBQVMsQ0FBQTt5QkFDekY7d0JBQ0QsTUFBTSxDQUFDLFVBQVUsRUFBRSxDQUFBO3FCQUN0Qjt5QkFBTTt3QkFDSCxLQUFLLENBQUMsNkJBQTZCLENBQUMsQ0FBQTt3QkFDcEMsUUFBUSxDQUFDLFFBQVEsQ0FBQyxJQUFJLEdBQUcsR0FBRyxDQUFBO3FCQUMvQjtnQkFDTCxDQUFDLEVBQ0QsVUFBVSxLQUFLO29CQUNYLG9DQUFvQztvQkFDcEMsS0FBSyxDQUFDLGFBQWEsR0FBRyxLQUFLLENBQUMsVUFBVSxDQUFDLENBQUE7b0JBQ3ZDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLElBQUksR0FBRyxFQUFFLENBQUE7b0JBQzFCLElBQUksR0FBRyxDQUFDLFFBQVEsQ0FBQyxhQUFhLEVBQUU7d0JBQzVCLE1BQU0sQ0FBQyxFQUFFLENBQUMsT0FBTyxDQUFDLENBQUE7cUJBQ3JCO2dCQUNMLENBQUMsQ0FDSixDQUFBO1lBQ0wsQ0FBQyxDQUFBO1lBRUQsTUFBTSxDQUFDLFVBQVUsR0FBRztnQkFDaEIsSUFBSSxXQUFXLEdBQUcsR0FBRyxDQUFDLFFBQVEsQ0FBQyxhQUFhO29CQUN4QyxDQUFDLENBQUMsR0FBRyxDQUFDLFFBQVEsQ0FBQyxhQUFhLEdBQUcsV0FBVyxHQUFHLEdBQUcsQ0FBQyxRQUFRLENBQUMsVUFBVTtvQkFDcEUsQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxNQUFNLEdBQUcsb0NBQW9DLENBQUE7Z0JBQy9FLEtBQUssQ0FBQztvQkFDRixNQUFNLEVBQUUsS0FBSztvQkFDYixHQUFHLEVBQUUsV0FBVztpQkFDbkIsQ0FBQyxDQUFDLElBQUksQ0FDSCxVQUFVLE9BQU87b0JBQ2IsSUFBSSxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRTt3QkFDdEIsT0FBTyxDQUFDLE9BQU8sQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLE9BQU8sRUFBRSxVQUFVLEtBQUssRUFBRSxHQUFHOzRCQUN0RCxNQUFNLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLENBQUE7d0JBQzFDLENBQUMsQ0FBQyxDQUFBO3dCQUVGLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLEdBQUcsTUFBTSxDQUFBO3dCQUN0QyxJQUFJLE9BQU8sTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxJQUFJLFdBQVcsSUFBSSxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLEVBQUU7NEJBQzFFLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLEdBQUcsS0FBSyxDQUFBOzRCQUNuQyxNQUFNLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsT0FBTyxHQUFHLENBQUMsQ0FBQTt5QkFDdEM7NkJBQU07NEJBQ0gsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxHQUFHLEVBQUUsR0FBRyxFQUFFLEtBQUssRUFBRSxPQUFPLEVBQUUsQ0FBQyxFQUFFLENBQUE7eUJBQ3ZEO3dCQUVELElBQUk7NEJBQ0EsTUFBTSxDQUFDLFVBQVUsQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLENBQUE7NEJBRTlCLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEdBQUcsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsTUFBTSxDQUFDLFFBQVEsQ0FBQTs0QkFDdEUsTUFBTSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsVUFBVSxDQUFDLFFBQVEsR0FBRyxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxVQUFVLENBQUMsTUFBTSxHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFVBQVUsQ0FBQyxLQUFLLEdBQUcsR0FBRyxDQUFBOzRCQUVuSCxJQUFJLE9BQU8sVUFBVSxDQUFDLGFBQWEsSUFBSSxXQUFXLEVBQUU7Z0NBQ2hELFVBQVUsQ0FBQyxhQUFhLEVBQUUsQ0FBQTs2QkFDN0I7NEJBRUQsSUFBSSxPQUFPLFVBQVUsQ0FBQyxvQkFBb0IsSUFBSSxXQUFXLEVBQUU7Z0NBQ3ZELFVBQVUsQ0FBQyxvQkFBb0IsRUFBRSxDQUFBOzZCQUNwQzs0QkFFRCxNQUFNLENBQUMsSUFBSSxDQUFDLElBQUksQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLFlBQVksR0FBRyxVQUFVLENBQUMsWUFBWSxFQUFFLENBQUE7NEJBQ25FLE1BQU0sQ0FBQyxJQUFJLENBQUMsSUFBSSxDQUFDLG1CQUFtQixHQUFHLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLE9BQU8sQ0FBQyxNQUFNLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQTt5QkFDL0Y7d0JBQUMsT0FBTyxHQUFHLEVBQUU7NEJBQ1YsT0FBTyxDQUFDLEdBQUcsQ0FBQyxHQUFHLENBQUMsQ0FBQTt5QkFDbkI7d0JBRUQsc0JBQXNCO3dCQUN0QixJQUFJLE1BQU0sR0FBRyxJQUFJLEdBQUcsQ0FBQyxRQUFRLENBQUMsUUFBUSxDQUFDLENBQUMsWUFBWSxDQUFBO3dCQUNwRCxVQUFVLENBQUMsbUJBQW1CLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxLQUFLLENBQUMsSUFBSSxHQUFHLENBQUMsQ0FBQyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFBO3dCQUV4RSx5REFBeUQ7d0JBQ3pELFVBQVUsQ0FBQyx3QkFBd0IsR0FBRyxJQUFJLENBQUE7d0JBRTFDLFFBQVEsTUFBTSxDQUFDLE9BQU8sQ0FBQyxJQUFJLEVBQUU7NEJBQ3pCLEtBQUssV0FBVztnQ0FDWixVQUFVLENBQUMsNkJBQTZCLEVBQUUsQ0FBQTtnQ0FDMUMsTUFBSzs0QkFDVCxLQUFLLGNBQWM7Z0NBQ2YsVUFBVSxDQUFDLGdDQUFnQyxFQUFFLENBQUE7Z0NBQzdDLE1BQUs7NEJBQ1QsS0FBSyxVQUFVO2dDQUNYLFVBQVUsQ0FBQyw0QkFBNEIsRUFBRSxDQUFBO2dDQUN6QyxNQUFLOzRCQUNULEtBQUssaUJBQWlCO2dDQUNsQixVQUFVLENBQUMsMkJBQTJCLEVBQUUsQ0FBQTtnQ0FDeEMsTUFBSzs0QkFDVCxLQUFLLGVBQWU7Z0NBQ2hCLFVBQVUsQ0FBQyxpQ0FBaUMsRUFBRSxDQUFBO2dDQUM5QyxNQUFLOzRCQUNULEtBQUssY0FBYztnQ0FDZixVQUFVLENBQUMsZ0NBQWdDLEVBQUUsQ0FBQTtnQ0FDN0MsTUFBSzs0QkFDVCxLQUFLLFFBQVE7Z0NBQ1QsVUFBVSxDQUFDLDBCQUEwQixFQUFFLENBQUE7Z0NBQ3ZDLE1BQUs7NEJBQ1QsS0FBSyxnQkFBZ0I7Z0NBQ2pCLFVBQVUsQ0FBQyxpQ0FBaUMsRUFBRSxDQUFBO2dDQUM5QyxNQUFLOzRCQUNULEtBQUssZUFBZTtnQ0FDaEIsVUFBVSxDQUFDLGdDQUFnQyxFQUFFLENBQUE7Z0NBQzdDLE1BQUs7NEJBQ1QsS0FBSyxnQkFBZ0I7Z0NBQ2pCLFVBQVUsQ0FBQyxnQ0FBZ0MsRUFBRSxDQUFBO2dDQUM3QyxNQUFLOzRCQUNULEtBQUssYUFBYTtnQ0FDZCxVQUFVLENBQUMsK0JBQStCLEVBQUUsQ0FBQTtnQ0FDNUMsTUFBSzs0QkFDVCxLQUFLLGFBQWE7Z0NBQ2QsVUFBVSxDQUFDLCtCQUErQixFQUFFLENBQUE7Z0NBQzVDLE1BQUs7NEJBQ1Q7Z0NBQ0ksTUFBSzt5QkFDWjt3QkFFRCxVQUFVLENBQUMscUJBQXFCLEVBQUUsQ0FBQSxDQUFDLGtCQUFrQjtxQkFDeEQ7O3dCQUFNLEtBQUssQ0FBQyxZQUFZLENBQUMsQ0FBQTtnQkFDOUIsQ0FBQyxFQUNELFVBQVUsS0FBSztvQkFDWCxLQUFLLENBQUMsWUFBWSxHQUFHLEtBQUssQ0FBQyxDQUFBO2dCQUMvQixDQUFDLENBQ0osQ0FBQTtZQUNMLENBQUMsQ0FBQTtZQUVELE1BQU0sQ0FBQyxVQUFVLEdBQUcsVUFBVSxJQUFJLEVBQUUsS0FBSztnQkFDckMsdUVBQXVFO2dCQUV2RSxJQUFJLEtBQUssR0FBRyxPQUFPLEtBQUssSUFBSSxXQUFXLENBQUMsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsS0FBSyxDQUFBO2dCQUV2RCxtQ0FBbUM7Z0JBQ25DLCtDQUErQztnQkFFL0MsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFFBQVEsRUFBRSxNQUFNLEVBQUUsUUFBUSxFQUFFLE9BQU8sRUFBRSxRQUFRLENBQUMsRUFBRSxVQUFVLEdBQUc7b0JBQzFFLElBQUksQ0FBQyxPQUFPLElBQUksQ0FBQyxNQUFNLElBQUksV0FBVyxJQUFJLE9BQU8sSUFBSSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsSUFBSSxXQUFXLENBQUMsSUFBSSxPQUFPLElBQUksQ0FBQyxHQUFHLENBQUMsSUFBSSxXQUFXLEVBQUU7d0JBQ2xILHdDQUF3Qzt3QkFDeEMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxHQUFHLENBQUMsR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLEdBQUcsQ0FBQyxDQUFDLENBQUE7cUJBQzdEO2dCQUNMLENBQUMsQ0FBQyxDQUFBO2dCQUVGLDZDQUE2QztnQkFDN0MsMENBQTBDO2dCQUMxQyw0Q0FBNEM7Z0JBQzVDLHlEQUF5RDtnQkFDekQsS0FBSztnQkFDTCxNQUFNO2dCQUVOLDJCQUEyQjtnQkFDM0IsMkJBQTJCO2dCQUMzQiw2QkFBNkI7Z0JBQzdCLE1BQU0sQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLEdBQUcsQ0FBQyxDQUFBO2dCQUMxQixNQUFNLENBQUMsTUFBTSxDQUFDLFNBQVMsQ0FBQyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsT0FBTyxDQUFDLE9BQU8sQ0FBQyxDQUFBO2dCQUUzRSxlQUFlO2dCQUNmLFVBQVUsQ0FBQyxlQUFlLENBQUMsSUFBSSxDQUFDLE9BQU8sQ0FBQyxFQUFFLEtBQUssQ0FBQyxDQUFBO2dCQUVoRCxvQkFBb0I7Z0JBQ3BCLElBQUksT0FBTyxJQUFJLENBQUMsS0FBSyxDQUFDLElBQUksV0FBVyxFQUFFO29CQUNuQywwQ0FBMEM7b0JBQzFDLE1BQU0sQ0FBQyxNQUFNLENBQUMsR0FBRyxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQTtpQkFDcEQ7Z0JBRUQsbUJBQW1CO2dCQUNuQixJQUFJLE9BQU8sVUFBVSxDQUFDLGNBQWMsSUFBSSxXQUFXLElBQUksT0FBTyxJQUFJLENBQUMsT0FBTyxDQUFDLElBQUksV0FBVyxFQUFFO29CQUN4RixVQUFVLENBQUMsY0FBYyxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsQ0FBQyxDQUFBO2lCQUMzQztnQkFFRCxvQkFBb0I7Z0JBQ3BCLElBQUksT0FBTyxJQUFJLENBQUMsVUFBVSxDQUFDLElBQUksV0FBVyxFQUFFO29CQUN4QywrQ0FBK0M7b0JBQy9DLE1BQU0sQ0FBQyxNQUFNLENBQUMsUUFBUSxHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxRQUFRLENBQUMsQ0FBQTtpQkFDOUQ7Z0JBRUQsSUFBSSxPQUFPLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxXQUFXLEVBQUU7b0JBQ3JDLDBDQUEwQztvQkFDMUMsTUFBTSxDQUFDLE1BQU0sQ0FBQyxLQUFLLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFBO2lCQUN4RDtZQUNMLENBQUMsQ0FBQTtZQUVELFVBQVUsQ0FBQyxlQUFlLEdBQUcsVUFBVSxLQUFLLEVBQUUsS0FBSztnQkFDL0MsT0FBTyxDQUFDLE9BQU8sQ0FBQyxLQUFLLEVBQUUsVUFBVSxTQUFTLEVBQUUsT0FBTztvQkFDL0MsSUFBSSxLQUFLLElBQUksT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxNQUFNLElBQUksV0FBVyxFQUFFO3dCQUNsRSw0REFBNEQ7d0JBQzVELE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sR0FBRyxFQUFFLENBQUE7d0JBQ3RDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxHQUFHLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxHQUFHLENBQUMsQ0FBQTt3QkFDcEYsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsTUFBTSxDQUFDLEtBQUssR0FBRzs0QkFDdEMsS0FBSyxFQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsS0FBSyxDQUFDOzRCQUNyRCxJQUFJLEVBQUUsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxJQUFJLENBQUM7NEJBQ25ELE1BQU0sRUFBRSxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQzs0QkFDdkQsUUFBUSxFQUFFLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxDQUFDLElBQUksQ0FBQyxLQUFLLENBQUMsT0FBTyxDQUFDLENBQUMsUUFBUSxDQUFDO3lCQUM5RCxDQUFBO3FCQUNKO29CQUNELElBQUksT0FBTyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxTQUFTLElBQUksV0FBVyxFQUFFO3dCQUM1RCxzREFBc0Q7d0JBQ3RELE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE1BQU0sQ0FBQyxJQUFJLEdBQUcsT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxPQUFPLENBQUMsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUE7d0JBQ2hHLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLE9BQU8sR0FBRyxPQUFPLENBQUMsSUFBSSxDQUFDLE1BQU0sQ0FBQyxJQUFJLENBQUMsS0FBSyxDQUFDLE9BQU8sQ0FBQyxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQTtxQkFDL0Y7Z0JB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