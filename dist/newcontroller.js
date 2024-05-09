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
        function ($rootScope, $scope, $log, $http, $timeout, Upload, env, TsiAuthentication, $state /*, websiteRequest*/) {
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
                        $scope.getUserAndData();
                }
            });
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
                    /*     var url_to_data = env.settings.is_new_render
                        ? env.settings.laravelApiUrl + 'savedata/' + env.settings.website_id
                        : $scope.data.vars.tsiCmsVars.apiUrl + '?action=WpTsiCmsApi&command=save' */
                    var url_to_data = env.settings.is_new_render
                        ? env.settings.laravelApiUrl + 'savedata/' + env.settings.website_id
                        : $scope.data.vars.tsiCmsVars.apiUrl + '';
                    const request = {
                        method: 'POST',
                        // url: url_to_data,
                        url: 'https://cms-routes.vercel.app/pages',
                        data: data,
                    };
                    /*
                    const requestVercel = {
                        method: 'POST',
                        url: 'https://cms-routes.vercel.app/pages',
                        data: data,
                    } */
                    $http(request, requestVercel)
                        .then(function (success) {
                        var response = success.data.payload;
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
                        // $rootScope.$broadcast('cms.onSave', { requestVercel, response })
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
                    console.log(pages);
                    $http({
                        method: 'POST',
                        // url: url_to_data,
                        url: 'https://cms-routes.vercel.app/pages',
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
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoibmV3Y29udHJvbGxlci5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uL25ld2NvbnRyb2xsZXIuanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUEsWUFBWSxDQUFBO0FBRVosTUFBTSxDQUFDLE9BQU8sR0FBRyxVQUFVLFFBQVE7SUFDL0IsUUFBUSxDQUFDLE1BQU0sQ0FBQztRQUNaLGdCQUFnQjtRQUNoQixVQUFVLGNBQWM7WUFDcEIscUNBQXFDO1lBRXJDLGtDQUFrQztZQUNsQyxxQkFBcUI7WUFDckIsZUFBZTtZQUNmLGdCQUFnQjtZQUNoQixpREFBaUQ7WUFDakQsdUNBQXVDO1lBQ3ZDLFlBQVk7WUFDWixTQUFTO1lBQ1QsaUJBQWlCO1lBQ2pCLDRFQUE0RTtZQUM1RSwyREFBMkQ7WUFDM0QsOERBQThEO1lBRTlELG9CQUFvQjtZQUNwQixpQ0FBaUM7WUFDakMsZ0NBQWdDO1lBQ2hDLGlCQUFpQjtZQUNqQixpQ0FBaUM7WUFDakMsNEJBQTRCO1lBQzVCLFNBQVM7WUFDVCxjQUFjO1lBQ2QsUUFBUTtZQUNSLE1BQU07WUFFTixjQUFjLENBQUMsS0FBSyxDQUFDLElBQUksRUFBRTtnQkFDdkIscUJBQXFCO2dCQUNyQixHQUFHLEVBQUUsS0FBSztnQkFDVixLQUFLLEVBQUU7b0JBQ0gsRUFBRSxFQUFFO3dCQUNBLFFBQVEsRUFBRSxPQUFPLENBQUMsaUJBQWlCLENBQUM7d0JBQ3BDLFVBQVUsRUFBRSxZQUFZO3FCQUMzQjtvQkFDRCxXQUFXLEVBQUU7d0JBQ1QsUUFBUSxFQUFFLE9BQU8sQ0FBQyxlQUFlLENBQUM7cUJBQ3JDO29CQUNELFVBQVUsRUFBRTt3QkFDUixRQUFRLEVBQUUsT0FBTyxDQUFDLHVCQUF1QixDQUFDO3dCQUMxQyxVQUFVLEVBQUUsT0FBTyxDQUFDLFNBQVMsQ0FBQyxDQUFDLFFBQVEsQ0FBQztxQkFDM0M7b0JBQ0QsU0FBUyxFQUFFO3dCQUNQLFFBQVEsRUFBRSxPQUFPLENBQUMsbUJBQW1CLENBQUM7cUJBQ3pDO29C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