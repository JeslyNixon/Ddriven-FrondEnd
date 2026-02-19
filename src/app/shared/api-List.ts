import { Subscription } from "rxjs";
export let baseUrl = '';
export const apiList: any ={
    Auth:{
        login:{relativeUrl:'api/auth/login'},
        register:{relativeUrl:'api/auth/company-settings'},
        logout:{relativeUrl: 'api/login/logout'},
        refresh:{relativeUrl:'api/auth/refresh-token'}
    },
    User:{
        getUsers:{relativeUrl:'api/users/get-users'},
        addUser:{relativeUrl:'api/users/add-user'},
        updateUser:{relativeUrl:'api/users/update-user'},
        deleteUser:{relativeUrl:'api/users/delete-user'},
        getuserbyid:{relativeUrl:'api/users/get-user'},
        getUserRoles:{relativeUrl:'api/users/get-user-roles'},
        syncUserRoles:{relativeUrl:'api/users/sync-user-roles'},
        removeRole:{relativeUrl:'api/users/remove-role'},
        assignRoles:{relativeUrl:'api/users/assign-role'},
    },
    Role:{
        getRoles:{relativeUrl:'api/roles/get-roles'},
        getRolesPaging:{relativeUrl:'api/roles/get-roles-all'},
        addRole:{relativeUrl:'api/roles/add-role'},
        updateRole:{relativeUrl:'api/roles/update-role'},
        deleteRole:{relativeUrl:'api/roles/delete-role'},
        getRoleById:{relativeUrl:'api/roles/show-Role'},
        restoreRole:{relativeUrl:'api/roles/restore'},
        exportRole:{relativeUrl:'api/roles/export-Roles'},
        toggleStatus:{relativeUrl:'api/roles/toggle-Status'},
        getActiveRoles:{relativeUrl:'api/roles/active-Roles'},
        assignUsersToRole:{relativeUrl:'api/roles/assign-Users-To-Role'},
        removeUserFromRole:{relativeUrl:'api/roles/remove-User-From-Role'}

    },
   Permission:{
        getPermissionsByRole: {relativeUrl: 'api/permissions/get-permissions-by-role'},
        updateRolePermissions: {relativeUrl: 'api/permissions/role-permissions-update'},
        viewRolePermissions: {relativeUrl: 'api/permissions/permissions-view'},
        storePermissions: {relativeUrl: 'api/permissions/permissions-store'},
        getModuleCount : {relativeUrl: 'api/permissions/module-count'},
        getPermissions : {relativeUrl: 'api/permissions/get-permissions'},
    },

    Masters:{
        getMasters:{relativeUrl:'api/masters'}
    },
    
    Status:{
        getAllStatus:{relativeUrl:'api/status-master/getAll'},
        getStatusById:{relativeUrl:'api/status-master/show'},
    },
    Properties:{
        getProperties:{relativeUrl:'api/properties/get-properties'},
        getPropertyById:{relativeUrl:'api/properties'},
        deleteProperty:{relativeUrl:'api/properties/delete-property'},
        saveProperties:{relativeUrl:'api/properties/save'},
        getPropertiesPdf:{relativeUrl:'api/properties/get-properties-pdf'},
        approveProperty:{relativeUrl:'api/properties/approve-property'},
        bulkApproveProperties:{relativeUrl:'api/properties/bulk-approve-properties'},
        exportProperties:{relativeUrl:'api/properties/export-properties'},
    },
    
}


function generateUrl(apiObj: any) {
    for (const topindex in apiObj) {
        if (apiObj[topindex].hasOwnProperty('relativeUrl')) {
            apiObj[topindex].url = baseUrl + apiObj[topindex].relativeUrl;
        } else {
            generateUrl(apiObj[topindex]);
        }
    }
}

export function setBaseUrl(_base_url: string) {
    baseUrl = _base_url;
    generateUrl(apiList);
}