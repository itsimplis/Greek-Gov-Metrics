import { Component, AfterViewInit, OnDestroy, ElementRef, Input } from '@angular/core';
import Map from 'ol/Map';
import View from 'ol/View';
import VectorLayer from 'ol/layer/Vector';
import VectorSource from 'ol/source/Vector';
import GeoJSON from 'ol/format/GeoJSON';
import { Fill, Stroke, Style } from 'ol/style';
import Link from 'ol/interaction/Link';
import Overlay from 'ol/Overlay';
import MouseWheelZoom from 'ol/interaction/MouseWheelZoom';
import DragPan from 'ol/interaction/DragPan';
import { SharedService } from 'src/app/service/shared.service';

@Component({
  selector: 'app-olmap',
  templateUrl: './olmap.component.html',
  styleUrls: ['./olmap.component.scss'],
})
export class OlmapComponent implements AfterViewInit, OnDestroy {
  @Input() mapType!: string;

  // Define class properties
  activeMapType:string = "";
  map?: Map;
  vectorSource?: VectorSource;
  vectorLayer?: VectorLayer<VectorSource>;
  overlay?: Overlay;
  defaultStyle?: Style;
  hoverStyle?: Style;
  hoveredFeature: any;
  munLabel: any;
  regLabel: any;

  constructor(private sharedService: SharedService, private elementRef: ElementRef) {
  }
  ngOnDestroy(): void {
    this.elementRef.nativeElement.remove();
  }

  // After View Initialization
  ngAfterViewInit(): void {

    this.activeMapType = 'Περιφερειών';

    // Set the VectorSource based on activeMapType
    if (this.activeMapType == 'Περιφερειών') {
      this.vectorSource = new VectorSource({
        url: '../../assets/maps/greek_peripheries.geojson',
        format: new GeoJSON(),
      });
    } else {
      this.vectorSource = new VectorSource({
        url: '../../assets/maps/greek_municipalities_caps.geojson',
        format: new GeoJSON(),
      });
    }

    // Set the VectorLayer with default Style
    this.vectorLayer = new VectorLayer({
      source: this.vectorSource,
      style: new Style({
        fill: new Fill({
          color: '#ffffff',
        }),
        stroke: new Stroke({
          color: '#319FD3',
          width: 1,
        }),
      }),
    });

    // Set the Map with interactions
    this.map = new Map({
      target: 'map',
      layers: [this.vectorLayer],
      view: new View({
        center: [504020, 4246067],
        zoom: 7,
        maxZoom: 11,
        minZoom: 7,
      }),
      interactions: [new Link(), new MouseWheelZoom(), new DragPan()],
    });

    // Disable the DragPan for the initial screen view
    this.map!.getInteractions().forEach((interaction) => {
      if (interaction instanceof DragPan) {
        interaction.setActive(false);
      }
    });

    // Add a change event listener to the view for zoom level handling
    this.map.getView().on('change:resolution', () => {
      const zoomLevel = this.map!.getView().getZoom();

      if (zoomLevel !== undefined && zoomLevel <= 7) {
        // Disable drag panning if zoom level is 7 or lower
        this.map!.getInteractions().forEach((interaction) => {
          if (interaction instanceof DragPan) {
            interaction.setActive(false);
          }
        });
      } else {
        // Enable drag panning for zoom levels greater than 7
        this.map!.getInteractions().forEach((interaction) => {
          if (interaction instanceof DragPan) {
            interaction.setActive(true);
          }
        });
      }
    });

    // Set default and hover Styles
    this.defaultStyle = new Style({
      fill: new Fill({
        color: '#ffffff',
      }),
      stroke: new Stroke({
        color: '#319FD3',
        width: 1,
      }),
    });

    this.hoverStyle = new Style({
      fill: new Fill({
        color: '#319FD3',
      }),
      stroke: new Stroke({
        color: '#319FD3',
        width: 1,
      }),
    });

    // Set the Overlay for tooltips
    this.overlay = new Overlay({
      element: document.createElement('div'),
      positioning: 'bottom-center',
    });

    // Configure CSS styles for the overlay element
    this.overlay.getElement()!.style.backgroundColor = '#fff';
    this.overlay.getElement()!.style.border = '1px solid #ccc';
    this.overlay.getElement()!.style.padding = '5px';
    this.overlay.getElement()!.style.fontFamily = 'Arial, sans-serif';
    this.overlay.getElement()!.style.fontSize = '14px';

    // Event Handling: On Mouse Pointer Move
    this.map.on('pointermove', (event: any) => {
      event.coordinate[1] += 10000;
      this.overlay!.getElement()!.style.display = 'none';
      const pixel = event.pixel;
      const hit = this.map!.hasFeatureAtPixel(pixel);

      // If there's a previously hovered feature, revert its style
      if (this.hoveredFeature) {
        this.hoveredFeature.setStyle(this.defaultStyle);
      }

      if (hit) {
        // Change to hovered style and show tooltip
        this.hoveredFeature = this.map!.getFeaturesAtPixel(pixel)[0];
        this.hoveredFeature.setStyle(this.hoverStyle);

        // Set tooltip text based on map type selection
        if (this.activeMapType == 'Περιφερειών') {
          const perValue = this.hoveredFeature.get('PER');
          const perValueShort = perValue.substring(3);
          this.overlay!.getElement()!.innerHTML = `ΠΕΡΙΦΕΡΕΙΑ ${perValueShort}`;
          this.regLabel = this.overlay!.getElement()!.innerHTML = `ΠΕΡΙΦΕΡΕΙΑ ${perValueShort}`;

        } else {
          const perValue = this.hoveredFeature.get('NAME');
          this.overlay!.getElement()!.innerHTML = `ΔΗΜΟΣ ${perValue}`;
          this.munLabel = this.overlay!.getElement()!.innerHTML = `ΔΗΜΟΣ ${perValue}`;
        }

        this.overlay!.setPosition(event.coordinate);
        this.overlay!.getElement()!.style.display = 'block';
      } else {
        // Reset the hovered feature to null if the mouse is not over any feature
        this.hoveredFeature = null;
      }
    });

    // Zoom handling on map click
    this.map.on('singleclick', (event: any) => {
      const pixel = event.pixel;
      const feature = this.map!.getFeaturesAtPixel(pixel)[0];
      //Execute the modal function for municipalities
      if (this.activeMapType == 'Δήμων') {
      if (feature) {
        // Get feature geometry and compute its extent
        const geometry = feature.getGeometry();
        const extent = geometry!.getExtent();
        this.sharedService.openMapModalMunicipalities(this.munLabel); // Open the modal if it is inside a feature

        // Calculate the center of the extent
        const center = [
          (extent[0] + extent[2]) / 2,
          (extent[1] + extent[3]) / 2,
        ];

        // Zoom to the feature
        this.map!.getView().animate({
          center: center,
          zoom: 9,
          duration: 700,
        });
      } else {
        const center = [504020, 4246067];
        // Zoom out to the center of the map
        this.map!.getView().animate({
          center: center,
          zoom: 7,
          duration: 700,
        });
      }
    }
          //Execute the modal function for regions
    else{
      if (feature) {
        // Get feature geometry and compute its extent
        const geometry = feature.getGeometry();
        const extent = geometry!.getExtent();
        this.sharedService.openMapModalRegions(this.regLabel); // Open the modal if it is inside a feature

        // Calculate the center of the extent
        const center = [
          (extent[0] + extent[2]) / 2,
          (extent[1] + extent[3]) / 2,
        ];

        // Zoom to the feature
        this.map!.getView().animate({
          center: center,
          zoom: 9,
          duration: 700,
        });
      } else {
        const center = [504020, 4246067];
        // Zoom out to the center of the map
        this.map!.getView().animate({
          center: center,
          zoom: 7,
          duration: 700,
        });
      }
    }
    });

    // Add the overlay to the map
    this.map.addOverlay(this.overlay!);
  }

  // Map type change event
  onMapTypeChange(mapType: string) {
    this.activeMapType = mapType;

    if (mapType == 'Περιφερειών') {
      this.vectorLayer!.setSource(
        new VectorSource({
          url: '../../assets/maps/greek_peripheries.geojson',
          format: new GeoJSON(),
        })
      );
    } else {
      this.vectorLayer!.setSource(
        new VectorSource({
          url: '../../assets/maps/greek_municipalities_caps.geojson',
          format: new GeoJSON(),
        })
      );
    }

    const center = [504020, 4246067];
    // Zoom out to the center of the map
    this.map!.getView().animate({
      center: center,
      zoom: 7,
      duration: 100,
    });
  }
}
