import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { apiList } from '../../shared/api-List';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class DataService {
  constructor(
    private http: HttpClient
  ) { }
  getProperties(param: any): Observable<any> {
    return this.http.post(apiList.Properties.getProperties.url, param);
  }
  getPropertiesPdf(params: any): Observable<Blob> {
    return this.http.post(apiList.Properties.getPropertiesPdf.url, params, {
      responseType: 'blob' // Third parameter is HTTP options
    });
  }
  approveProperty(param: any): Observable<any> {
    return this.http.post(apiList.Properties.approveProperty.url, param);
  }
  exportProperties(params: any): Observable<Blob> {
    return this.http.post(apiList.Properties.exportProperties.url, params, {
      responseType: 'blob' // Third parameter is HTTP options
    });
  }
  deleteProperty(param: any): Observable<any> {
    return this.http.post(apiList.Properties.deleteProperty.url, param);
  }
  bulkApproveProperties(param: any): Observable<any> {
    return this.http.post(apiList.Properties.bulkApproveProperties.url, param);
  }

   getRoles(): Observable<any> {
   return this.http.get(apiList.Role.getRoles.url);
  }
  getRolesPaging(params:any): Observable<any> {
     return this.http.post(apiList.Role.getRolesPaging.url, params);
  }
  addRole(params: any): Observable<any> {
    return this.http.post(apiList.Role.addRole.url, params);
  }
  updateRole(params: any): Observable<any> {
    return this.http.post(apiList.Role.updateRole.url, params);
  }
  deleteRole(params: any): Observable<any> {
    return this.http.post(apiList.Role.deleteRole.url, params);
  }
  
  getUsers(params:any): Observable<any> {
     return this.http.post(apiList.User.getUsers.url, params);
  }
 
  createUser(params: any): Observable<any> {
    return this.http.post(apiList.User.addUser.url, params);
  }
  updateUser(params: any): Observable<any> {
    return this.http.post(apiList.User.updateUser.url, params);
  }
  deleteUser(params: any): Observable<any> {
    return this.http.post(apiList.User.deleteUser.url, params);
  }
  
  syncUserRoles(params:any): Observable<any> {
    return this.http.post(apiList.User.syncUserRoles.url, params);
  }
  assignRole(params: any): Observable<any> {
     return this.http.post(apiList.User.assignRole.url, params);
  }

  removeRole(params: any): Observable<any> {
    return this.http.post(apiList.User.removeRole.url, params);
  }

  getUserRoles(params: any): Observable<any> {
     return this.http.post(apiList.User.getUserRoles.url, params);
  }
  getPermissionsByRole(params: any): Observable<any> {
     return this.http.post(apiList.Permission.getPermissionsByRole.url, params);
  }
  getAllPermissions(): Observable<any> {
     return this.http.get(apiList.Permission.getPermissions.url);
  }
  updateRolePermissions(params: any): Observable<any> {
     return this.http.post(apiList.Permission.updateRolePermissions.url, params);
  }
}
