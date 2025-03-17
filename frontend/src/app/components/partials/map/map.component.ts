import { Component, ElementRef, Input, OnChanges, ViewChild } from '@angular/core';
import { icon, LatLng, LatLngExpression, LatLngTuple, LeafletMouseEvent, map, Map, marker, Marker, tileLayer } from 'leaflet';
import { LocationService } from '../../../services/location.service';
import { Order } from '../../../shared/models/Order';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'map',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './map.component.html',
  styleUrl: './map.component.css'
})
export class MapComponent implements OnChanges {
  @Input() order!: Order;
  @Input() readonly: boolean = false;

  private readonly MARKER_ZOOM_LEVEL = 16;
  private readonly MARKER_ICON = icon({
    iconUrl: 'https://res.cloudinary.com/foodmine/image/upload/v1638842791/map/marker_kbua9q.png',
    iconSize: [42, 42],
    iconAnchor: [21, 42]
  });

  private readonly DEFAULT_LATLNG : LatLngTuple = [0, 0];

  @ViewChild('map', { static: true })
  mapRef!: ElementRef;

  map!: Map;
  currentMarker!: Marker;

  constructor(private locationService: LocationService) {

  }

  ngOnChanges() : void {
    if(!this.order) return;
    this.InitializeMap();

    if(this.readonly && this.addressLatLng) {
      this.ShowLocationOnReadonlyMode();
    }
  }

  ShowLocationOnReadonlyMode() {
    const m = this.map;

    this.setMarker(this.addressLatLng);
    m.setView(this.addressLatLng, this.MARKER_ZOOM_LEVEL);
    m.dragging.disable();
    m.touchZoom.disable();
    m.doubleClickZoom.disable();
    m.scrollWheelZoom.disable();
    m.boxZoom.disable();
    m.keyboard.disable();
    m.off('click');
    m.tapHold?.disable();
    this.currentMarker.dragging?.disable(); // Disable dragging for the current marker
  }

  InitializeMap() {
    if(this.map) return;

    this.map = map(this.mapRef.nativeElement, {
      attributionControl: false
    }).setView(this.DEFAULT_LATLNG, 1);

    // Añadir capa de OpenStreetMap
    tileLayer('https://{s}.tile.osm.org/{z}/{x}/{y}.png').addTo(this.map);

    this.map.on('click', (e : LeafletMouseEvent) => {
      this.setMarker(e.latlng);
    });
  }

  findMyLocation() {
    this.locationService.getCurrentLocation().subscribe({
      next: (latlng) => {
        // Centrar el mapa en la posición actual
        this.map.setView(latlng, this.MARKER_ZOOM_LEVEL);
        this.setMarker(latlng);
      }
    });
  }

  /**
   * Añadir un marcador en la posición actual.
   * @param latlng 
   * @returns 
   */
  setMarker(latlng : LatLngExpression) {
    this.addressLatLng = latlng as LatLng;

    if(this.currentMarker) {
      this.currentMarker.setLatLng(latlng);
      this.currentMarker.bindPopup("¡Estás aquí!").openPopup();
      return;
    }

    this.currentMarker = marker(latlng, {
      draggable: true,
      icon: this.MARKER_ICON
    }).addTo(this.map);

    // Listener to getting the current marker location after dragging is finished
    this.currentMarker.on('dragend', () => {
      this.addressLatLng = this.currentMarker.getLatLng();
    });
  }

  // Se limitan las configuraciones de las coordenadas a 8 decimales, ya que MongoDB solo acepta 8 decimales
  set addressLatLng(latlng: LatLng) {
    // IMPORTANT: This is a workaround to fix the issue of the latlng object not having the toFixed method.
    // Values coming from the server are strings, so this is only useful when changing manually the marker position.
    if(!latlng.lat.toFixed) return;

    latlng.lat = parseFloat(latlng.lat.toFixed(8));
    latlng.lng = parseFloat(latlng.lng.toFixed(8));

    this.order.addressLatLng = latlng;
    // console.log(this.order.addressLatLng);
  }

  get addressLatLng() : LatLng {
    return this.order.addressLatLng!;
  }
}
