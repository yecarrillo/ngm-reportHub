/* *
 * The MIT License
 *
 * Copyright (c) 2015, Patrick Fitzgerald
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

'use strict';

angular.module('ngm.widget.leaflet', ['ngm.provider'])
  .config(function(dashboardProvider){
    dashboardProvider
      .widget('leaflet', {
        title: 'Leaflet',
        description: 'Displays a Leaflet Map',
        controller: 'leafletCtrl',
        templateUrl: 'widgets/ngm-leaflet/view.html',
        resolve: {
          data: function(ngmData, config){
            if (config.request){
              return ngmData.get(config.request);
            }
          }
        }
      });
  }).controller('leafletCtrl', [
    '$scope', 
    '$element',
    'leafletMarkersHelpers',
    'leafletData',
    'data', 
    'config',
    function($scope, $element, leafletMarkersHelpers, leafletData, data, config){

      // resets markers to avoid error - https://github.com/tombatossals/angular-leaflet-directive/issues/381
      $scope.$on('$destroy', function () {
        leafletMarkersHelpers.resetMarkerGroups();
      });
    
      // leaflet widget default config
      $scope.leaflet = {
        id: 'ngm-leaflet-' + Math.floor((Math.random()*1000000)),
        height: '320px',
        display: {
          type: 'default',
        },
        defaults: {
          center: { lat: 34.5, lng: 66, zoom: 6 },
          scrollWheelZoom: false,
          attributionControl: false,
          tileLayer: 'https://api.mapbox.com/v4/fitzpaddy.b207f20f/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZml0enBhZGR5IiwiYSI6ImNpZW1vcXZiaTAwMXBzdGtrYmp0cDlkdnEifQ.NCI7rTR3PvN4iPZpt6hgKA',

        },
        markers: {},
        layers: {
          baselayers: {
            osm: {
                name: 'Afghanistan',
                type: 'xyz',
                url: 'https://api.mapbox.com/v4/fitzpaddy.b207f20f/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoiZml0enBhZGR5IiwiYSI6ImNpZW1vcXZiaTAwMXBzdGtrYmp0cDlkdnEifQ.NCI7rTR3PvN4iPZpt6hgKA',
                layerOptions: {
                    continuousWorld: true
                }
            }
          }         
        }

      }

      // Merge defaults with config
      $scope.leaflet = angular.merge({}, $scope.leaflet, config);

      console.log($scope.leaflet)

      if ($scope.leaflet.display.type === 'default') {
        $scope.leaflet.geojson = data;
      } else {
        $scope.leaflet.markers = data;
      }

      // set timeout to get map
      setTimeout(function(){
        // perform map actions once map promise retrned
        leafletData.getMap().then(function(map) {
          // map $scope
          $scope.leaflet.map = map;
        });
      });

    }

  ]);


