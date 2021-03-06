/**
 * @ngdoc function
 * @name ngmReportHubApp.controller:ClusterProjectProjectsCtrl
 * @description
 * # ClusterProjectProjectsCtrl
 * Controller of the ngmReportHub
 */
angular.module( 'ngmReportHub' )
	.controller( 'ClusterProjectProjectsCtrl', ['$scope', '$location', '$route', 'ngmAuth', 'ngmData', 'ngmUser', 'ngmClusterHelper','$translate','$filter', function ( $scope, $location, $route, ngmAuth, ngmData, ngmUser, ngmClusterHelper,$translate, $filter ) {
		this.awesomeThings = [
			'HTML5 Boilerplate',
			'AngularJS',
			'Karma'
		];

		// report object
		$scope.report = {

			// ngm
			ngm: $scope.$parent.ngm,

			// user
			user: ngmUser.get(),

			// form to add new project
			newProjectUrl: '#/cluster/projects/details/new',

			// report download title
			report_title: ngmUser.get().organization_tag  +'_projects-extracted-' + moment().format( 'YYYY-MM-DDTHHmm' ),

			// title
			title: ngmUser.get().admin0name.toUpperCase().substring( 0, 3 ) + ' | ' + ngmUser.get().organization + ' | Projects',

			// subtitle
			subtitle: 'Projects for ' + ngmUser.get().organization + ' ' + ngmUser.get().admin0name,

			// get url
			getMenuUrl: function( cluster_id ){

				// default
				var url = '/desk/#/cluster/projects';
				
				// if org
				if ( $route.current.params.organization_id ) {
					url += '/organization/' + $route.current.params.organization_id;
				}
				url += '/' + cluster_id;
				
				return url;
			},

			// organization
			getOrganizationHref: function() {
				var href = '#/cluster/organization';
				if ( $route.current.params.organization_id ) { href += '/' + $route.current.params.organization_id }
				return href;
			},

			// get organization
			getOrganization: function( organization_id ){

				// return http
				var request = {
					method: 'POST',
					url: ngmAuth.LOCATION + '/api/getOrganization',
					data: {
						'organization_id': organization_id
					}
				}

				// return
				return request;
			},

			// set the header titles
			setTitles: function(){
				
				// if org_id, get org data
				if ( $route.current.params.organization_id ) {

					// fetch org data
					ngmData
						.get( $scope.report.getOrganization( $scope.report.organization_id ) )
						.then( function( organization ){
								
							// set titles
							$scope.model.header.download.downloads[0].request.data.report = organization.organization_tag  +'_projects-extracted-' + moment().format( 'YYYY-MM-DDTHHmm' );
							$scope.model.header.title.title = organization.admin0name.toUpperCase().substring( 0, 3 ) + ' | ' + organization.organization + ' | Projects';
							$scope.model.header.subtitle.title = 'Projects for ' + organization.organization + ' ' + organization.admin0name;

						});

				}
			},

			// set menu
			setMenu: function(){
				// get menu
				ngmData
					.get( request = {
									method: 'POST',
									url: ngmAuth.LOCATION + '/api/cluster/project/getProjectSectors',
									data: { organization_id: $scope.report.organization_id }
					} )
					.then( function( sectors ){

						// for each sector
						angular.forEach( sectors, function( d, i ){
							$scope.model.menu[ 0 ].rows.push({
								'title': d.cluster,
								'param': 'cluster_id',
								'active': d.cluster,
								'class': 'grey-text text-darken-2 waves-effect waves-teal waves-teal-lighten-4',
								'href': $scope.report.getMenuUrl( d.cluster_id )
							});
						});
					});		
			},

			// fetches request for project list
			getProjectRequest: function( project_status ) {

				// filter
				var filter = {
						organization_id: $scope.report.organization_id,
						project_status: project_status
					}

				// add cluster
				if ( $scope.report.cluster_id !== 'all' ) {
					filter = angular.merge( filter, { cluster_id: $scope.report.cluster_id } );
				}

				// get projects
				var request = {
							method: 'POST',
							url: ngmAuth.LOCATION + '/api/cluster/project/getProjectsList',
							data: { filter: filter }
						}

				// return
				return request;

			},

			// init
			init: function() {

				// org id
				$scope.report.organization_id =
						$route.current.params.organization_id ? $route.current.params.organization_id : ngmUser.get().organization_id;

				// org tag
				$scope.report.organization_tag =
						$route.current.params.organization_tag ? $route.current.params.organization_tag : ngmUser.get().organization_tag;

				// sector
				$scope.report.cluster_id = 
						$route.current.params.cluster_id ? $route.current.params.cluster_id : ngmUser.get().cluster_id;

				// report dashboard model
				$scope.model = {
					name: 'cluster_project_list',
					header: {
						div: {
							'class': 'col s12 m12 l12 report-header',
							style: 'border-bottom: 3px ' + $scope.report.ngm.style.defaultPrimaryColor + ' solid;'
						},
						title: {
							'class': 'col s12 m9 l9 report-title truncate',
							style: 'font-size: 3.4rem; color: ' + $scope.report.ngm.style.defaultPrimaryColor,
							title: $scope.report.title
						},
						subtitle: {
							'class': 'col s12 m12 l12 report-subtitle hide-on-small-only',
							title: $scope.report.subtitle
						},
						download: {
							'class': 'col s12 m3 l3 hide-on-small-only',
							downloads: [{
								type: 'csv',
								color: 'blue lighten-2',
								icon: 'assignment',
								hover: 'Download Project Summaries as CSV',
								request: {
									method: 'POST',
									url: ngmAuth.LOCATION + '/api/cluster/project/getProjects',
									data: {
										details: 'projects',
										report: $scope.report.report_title +'_projects-extracted-' + moment().format( 'YYYY-MM-DDTHHmm' ),
										query: { organization_id: $scope.report.organization_id },
										csv:true
									}
								},
								metrics: {
									method: 'POST',
									url: ngmAuth.LOCATION + '/api/metrics/set',
									data: {
										organization: $scope.report.user.organization,
										username: $scope.report.user.username,
										email: $scope.report.user.email,
										dashboard: 'projects list',
										theme: 'organization_projects_details',
										format: 'csv',
										url: $location.$$path

									}
								}
							}]

						}
					},
					menu:[{
						// 'search': true,
						'id': 'search-sector',
						'icon': 'camera',
						'title': 'Sector',
						'class': 'teal lighten-1 white-text',
						'rows': [{
							'title': 'All',
							'param': 'cluster_id',
							'active': 'all',
							'class': 'grey-text text-darken-2 waves-effect waves-teal waves-teal-lighten-4',
							'href': $scope.report.getMenuUrl( 'all' )
						}]
					}],
					rows: [{
						columns: [{
							styleClass: 's12 m12 l12',
							widgets: [{
								type: 'html',
								card: 'white grey-text text-darken-2',
								style: 'padding: 20px;',
								config: {
									html: '<a class="btn-flat waves-effect waves-teal left hide-on-small-only" href="' + $scope.report.getOrganizationHref() + '"><i class="material-icons left">keyboard_return</i>Back to Organization</a><a class="waves-effect waves-light btn right" href="' + $scope.report.newProjectUrl + '"><i class="material-icons left">add_circle_outline</i>Add New Project</a>'
								}
							}]
						}]
					},{
						columns: [{
							styleClass: 's12 m12 l12',
							widgets: [{
								type: 'list',
								card: 'white grey-text text-darken-2',
								config: {
									titleIcon: 'alarm_on',
									// color: 'teal lighten-4',
									color: 'blue lighten-1',
									textColor: 'white-text',
									title: 'Active Projects',
									icon: 'edit',
									request: $scope.report.getProjectRequest( 'active' )
								}
							}]
						}]
					},{
						columns: [{
							styleClass: 's12 m12 l12',
							widgets: [{
								type: 'list',
								card: 'white grey-text text-darken-2',
								config: {
									titleIcon: 'done_all',
									// color: 'lime lighten-4',
									color: 'blue lighten-1',
									textColor: 'white-text',
									title: 'Completed Projects',
									icon: 'done',
									request: $scope.report.getProjectRequest( 'complete' )
								}
							}]
						}]
					},{
						columns: [{
							styleClass: 's12 m12 l12',
							widgets: [{
								type: 'html',
								card: 'card-panel',
								style: 'padding:0px; height: 90px; padding-top:10px;',
								config: {
									html: $scope.report.ngm.footer
								}
							}]
						}]
					}]
				};

				// assign to ngm app scope
				$scope.report.ngm.dashboard.model = $scope.model;

				// set title
				$scope.report.setTitles();
				
				// set menus
				$scope.report.setMenu();

			}

		}

		// init
		$scope.report.init();

	}]);
