import { Injectable } from '@angular/core';
import { LatLngLiteral } from 'leaflet';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class LocationService {

  constructor() { }

  /**
   * Usar la API de Geolocalización para obtener la ubicación actual.
   * @returns Observable<LatLngLiteral>
   */
  getCurrentLocation() : Observable<LatLngLiteral> {
    return new Observable((observer) => {
      // Check if current browser supports Geolocation
      if(!navigator.geolocation) return;

      return navigator.geolocation.getCurrentPosition(
        (pos) => {
          observer.next({
            lat: pos.coords.latitude,
            lng: pos.coords.longitude
          })
        }, 
        (error) => {
          observer.error(error);
        }, {
          // Opciones para mejorar la precisión de la ubicación
          enableHighAccuracy: true, // Solicita la mayor precisión posible
          timeout: 5000,           // Tiempo máximo para obtener la ubicación (ms)
          maximumAge: 0            // No utilizar ubicaciones en caché
        })
    })
  }
}
