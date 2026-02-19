import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { apiList } from '../../shared/api-List';

export interface Master {
  id: number;
  code: string;
  name: string;
  type: string;
}

export interface MastersData {
  land_shape: Master[];
  level_vs_road: Master[];
  topography: Master[];
  soil_type: Master[];
  access_status: Master[];
  access_roads_count: Master[];
  road_type: Master[];
  public_transport: Master[];
  neighbourhood: Master[];
  development_status: Master[];
  high_tension_lines: Master[];
  canal_drain: Master[];
  boundary_demarcation: Master[];
}

@Injectable({
  providedIn: 'root'
})
export class PropertyInspectionService {

  constructor(private http: HttpClient) {}

  /**
   * Get all masters for dropdowns
   */
   getMasters(): Observable<{ success: boolean; data: MastersData }> {
     // return this.http.get<{ success: boolean; data: MastersData }>(`${this.apiUrl}/masters`);
     return this.http.get<{ success: boolean; data: MastersData }>(apiList.Masters.getMasters.url);
   }

  /**
   * Get masters by type
   */
   getMastersByType(type: string) {
  return this.http.get<any>(`${apiList.Masters.getMastersByType.url}/${type}`
  );
}

  /**
   * Save inspection - sends master IDs, not text values
   */
  saveInspection(data: any): Observable<any> {
    const formData = this.buildFormData(data);
    //return this.http.post(`${this.apiUrl}/property-inspections`, formData);
    return this.http.post(apiList.Properties.saveProperties.url, formData);
  }

  /**
   * Get all inspections
   */
  getAllInspections(param: any): Observable<any> {
  return this.http.post(apiList.Properties.getProperties.url, param);
  }

  /**
   * Get single inspection by ID
   */
  getInspection(id: number): Observable<any> {
    return this.http.get(`${apiList.Properties.getPropertyById.url}/${id}`);
  }


  /**
   * Build FormData - sends master IDs
   */
  private buildFormData(data: any): FormData {
    const formData = new FormData();

    // Add property ID if editing (for UPDATE)
    if (data.propertyId) {
      formData.append('propertyId', data.propertyId.toString());
    }

    formData.append('propertyDetails[isDraft]', data.isDraft ? '1' : '0');
    // Property Details
    formData.append('propertyDetails[projectId]', data.propertyDetails.projectId || '');
    formData.append('propertyDetails[bank]', data.propertyDetails.bank || '');
    formData.append('propertyDetails[ownerName]', data.propertyDetails.ownerName || '');
    formData.append('propertyDetails[address]', data.propertyDetails.address || '');
    formData.append('propertyDetails[personMet]', data.propertyDetails.personMet || '');
    formData.append('propertyDetails[contactNumber]', data.propertyDetails.contactNumber || '');
    formData.append('propertyDetails[purposeValuation]', data.propertyDetails.purposeValuation ? '1' : '0');
    formData.append('propertyDetails[purposeDueDiligence]', data.propertyDetails.purposeDueDiligence ? '1' : '0');
    formData.append('propertyDetails[purposeFeasibility]', data.propertyDetails.purposeFeasibility ? '1' : '0');

    // Land Particulars - Send MASTER IDs (not text values)
    if (data.landParticulars.shapeId) {
      formData.append('landParticulars[shapeId]', data.landParticulars.shapeId.toString());
    }
    if (data.landParticulars.levelVsRoadId) {
      formData.append('landParticulars[levelVsRoadId]', data.landParticulars.levelVsRoadId.toString());
    }
    if (data.landParticulars.topographyId) {
      formData.append('landParticulars[topographyId]', data.landParticulars.topographyId.toString());
    }
    if (data.landParticulars.soilTypeId) {
      formData.append('landParticulars[soilTypeId]', data.landParticulars.soilTypeId.toString());
    }
    formData.append('landParticulars[waterStagnation]', data.landParticulars.waterStagnation ? '1' : '0');
    formData.append('landParticulars[remarks]', data.landParticulars.remarks || '');

    // Location Access - Send MASTER IDs
    if (data.locationAccess.accessStatusId) {
      formData.append('locationAccess[accessStatusId]', data.locationAccess.accessStatusId.toString());
    }
    formData.append('locationAccess[landlockDistance]', data.locationAccess.landlockDistance || '');
    if (data.locationAccess.accessRoadsCountId) {
      formData.append('locationAccess[accessRoadsCountId]', data.locationAccess.accessRoadsCountId.toString());
    }
    
    // Primary Road
    formData.append('locationAccess[primaryRoadName]', data.locationAccess.primaryRoadName || '');
    if (data.locationAccess.primaryRoadTypeId) {
      formData.append('locationAccess[primaryRoadTypeId]', data.locationAccess.primaryRoadTypeId.toString());
    }
    formData.append('locationAccess[primaryRoadWidth]', data.locationAccess.primaryRoadWidth || '');
    
    // Secondary Road
    formData.append('locationAccess[secondaryRoadName]', data.locationAccess.secondaryRoadName || '');
    if (data.locationAccess.secondaryRoadTypeId) {
      formData.append('locationAccess[secondaryRoadTypeId]', data.locationAccess.secondaryRoadTypeId.toString());
    }
    formData.append('locationAccess[secondaryRoadWidth]', data.locationAccess.secondaryRoadWidth || '');
    
    // Tertiary Road
    formData.append('locationAccess[tertiaryRoadName]', data.locationAccess.tertiaryRoadName || '');
    if (data.locationAccess.tertiaryRoadTypeId) {
      formData.append('locationAccess[tertiaryRoadTypeId]', data.locationAccess.tertiaryRoadTypeId.toString());
    }
    formData.append('locationAccess[tertiaryRoadWidth]', data.locationAccess.tertiaryRoadWidth || '');
    
    // Public Transport
    if (data.locationAccess.publicTransport && data.locationAccess.publicTransport.length > 0) {
      formData.append('locationAccess[publicTransport]', data.locationAccess.publicTransport.join(','));
    }
    formData.append('locationAccess[nearestTransportNode]', data.locationAccess.nearestTransportNode || '');
    
    // Neighbourhood and Development
    if (data.locationAccess.neighbourhoodId) {
      formData.append('locationAccess[neighbourhoodId]', data.locationAccess.neighbourhoodId.toString());
    }
    if (data.locationAccess.developmentStatusId) {
      formData.append('locationAccess[developmentStatusId]', data.locationAccess.developmentStatusId.toString());
    }

    // Site Boundaries
    formData.append('siteBoundaries[north]', data.siteBoundaries.north || '');
    formData.append('siteBoundaries[south]', data.siteBoundaries.south || '');
    formData.append('siteBoundaries[east]', data.siteBoundaries.east || '');
    formData.append('siteBoundaries[west]', data.siteBoundaries.west || '');
    formData.append('siteBoundaries[boundariesIdentified]', data.siteBoundaries.boundariesIdentified ? '1' : '0');
    formData.append('siteBoundaries[boundaryDemarcation]', data.siteBoundaries.boundaryDemarcation || '');
    formData.append('siteBoundaries[boundaryDetails]', data.siteBoundaries.boundaryDetails || '');

    // Other Observations - Send MASTER IDs
    formData.append('otherObservations[roadWideninsSigns]', data.otherObservations.roadWideninsSigns ? '1' : '0');
    if (data.otherObservations.highTensionLinesId) {
      formData.append('otherObservations[highTensionLinesId]', data.otherObservations.highTensionLinesId.toString());
    }
    if (data.otherObservations.canalDrainId) {
      formData.append('otherObservations[canalDrainId]', data.otherObservations.canalDrainId.toString());
    }
    formData.append('otherObservations[waterBodyNearby]', data.otherObservations.waterBodyNearby ? '1' : '0');
    formData.append('otherObservations[otherRestrictions]', data.otherObservations.otherRestrictions || '');

    // Summary
    formData.append('summary[keyPositives]', data.summary.keyPositives || '');
    formData.append('summary[keyNegatives]', data.summary.keyNegatives || '');
    formData.append('summary[redFlags]', data.summary.redFlags || '');

    // Photos
    if (data.photos && data.photos.length > 0) {
      data.photos.forEach((photo: File, index: number) => {
        formData.append(`photos[${index}]`, photo, photo.name);
      });
    }

    return formData;
  }
}