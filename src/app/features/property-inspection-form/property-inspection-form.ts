import { Component, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { PropertyInspectionService, Master } from '../../services/property-inspection/property-inspection';

interface PropertyDetails {
  projectId: string;
  bank: string;
  ownerName: string;
  purposeOfInspection: string[];
  purposeValuation: boolean;
  purposeDueDiligence: boolean;
  purposeFeasibility: boolean;
  address: string;
  personMet: string;
  contactNumber: string;
}

interface LocationAccess {
  accessStatus: string;
  accessStatusId: number | null;
  landlockDistance: string;
  numberOfAccessRoads: string;
  accessRoadsCountId: number | null;
  primaryRoadName: string;
  primaryRoadType: string;
  primaryRoadTypeId: number | null;
  primaryRoadWidth: string;
  secondaryRoadName: string;
  secondaryRoadType: string;
  secondaryRoadTypeId: number | null;
  secondaryRoadWidth: string;
  tertiaryRoadName: string;
  tertiaryRoadType: string;
  tertiaryRoadTypeId: number | null;
  tertiaryRoadWidth: string;
  publicTransport: string[];
  nearestTransportNode: string;
  neighbourhood: string[];
  neighbourhoodId: number | null;
  developmentStatus: string;
  developmentStatusId: number | null;
}

interface LandParticulars {
  shape: string;
  shapeId: number | null;
  levelVsRoad: string;
  levelVsRoadId: number | null;
  topography: string;
  topographyId: number | null;
  soilType: string[];
  soilTypeId: number | null;
  waterStagnation: string;
  remarks: string;
}

interface SiteBoundaries {
  north: string;
  south: string;
  east: string;
  west: string;
  boundariesIdentified: string;
  boundary_demarcation: string[];
  boundaryDetails: string;
}

interface OtherObservations {
  roadWideninsSigns: string;
  highTensionLines: string;
  highTensionLinesId: number | null;
  canalDrain: string;
  canalDrainId: number | null;
  waterBodyNearby: string;
  otherRestrictions: string;
}

interface Summary {
  keyPositives: string;
  keyNegatives: string;
  redFlags: string;
}

interface ValidationErrors {
  [key: string]: string;
}

@Component({
  selector: 'app-property-inspection-form',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './property-inspection-form.html',
  styleUrl: './property-inspection-form.scss'
})
export class PropertyInspectionFormComponent implements OnInit {
  currentStep = signal(1);
  totalSteps = 7;
  currentDate = new Date().toISOString().split('T')[0];
  
  // Loading and submission states
  isSubmitting = signal(false);
  submitError = signal('');
  submitSuccess = signal(false);
  isLoadingMasters = signal(true);
  isLoadingProperty = signal(false);
  
  // Edit mode
  isEditMode = signal(false);
  propertyId: number | null = null;
  
  // Validation errors
  validationErrors = signal<ValidationErrors>({});
  
  // Masters data from API
  masters = signal<any>({});
  
  // Form data with updated structure
  propertyDetails = signal<PropertyDetails>({
    projectId: '',
    bank: '',
    ownerName: '',
    purposeOfInspection: [],
    purposeValuation: false,
    purposeDueDiligence: false,
    purposeFeasibility: false,
    address: '',
    personMet: '',
    contactNumber: ''
  });

  locationAccess = signal<LocationAccess>({
    accessStatus: '',
    accessStatusId: null,
    landlockDistance: '',
    numberOfAccessRoads: '',
    accessRoadsCountId: null,
    primaryRoadName: '',
    primaryRoadType: '',
    primaryRoadTypeId: null,
    primaryRoadWidth: '',
    secondaryRoadName: '',
    secondaryRoadType: '',
    secondaryRoadTypeId: null,
    secondaryRoadWidth: '',
    tertiaryRoadName: '',
    tertiaryRoadType: '',
    tertiaryRoadTypeId: null,
    tertiaryRoadWidth: '',
    publicTransport: [],
    nearestTransportNode: '',
    neighbourhood: [],
    neighbourhoodId: null,
    developmentStatus: '',
    developmentStatusId: null
  });

  landParticulars = signal<LandParticulars>({
    shape: '',
    shapeId: null,
    levelVsRoad: '',
    levelVsRoadId: null,
    topography: '',
    topographyId: null,
    soilType: [],
    soilTypeId: null,
    waterStagnation: '',
    remarks: ''
  });

  siteBoundaries = signal<SiteBoundaries>({
    north: '',
    south: '',
    east: '',
    west: '',
    boundariesIdentified: '',
    boundary_demarcation: [],
    boundaryDetails: ''
  });

  otherObservations = signal<OtherObservations>({
    roadWideninsSigns: '',
    highTensionLines: '',
    highTensionLinesId: null,
    canalDrain: '',
    canalDrainId: null,
    waterBodyNearby: '',
    otherRestrictions: ''
  });

  uploadedPhotos = signal<File[]>([]);
  
  summary = signal<Summary>({
    keyPositives: '',
    keyNegatives: '',
    redFlags: ''
  });

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private propertyInspectionService: PropertyInspectionService
  ) {}

  ngOnInit(): void {
    // Check if we're in edit mode
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.propertyId = +params['id'];
        this.isEditMode.set(true);
        console.log('📝 Edit mode - Loading property ID:', this.propertyId);
      }
    });

    // Load masters data first
    this.loadMasters();
    
    // If edit mode, load property data after masters
    if (this.isEditMode()) {
      this.loadPropertyData();
    }
  }

  /**
   * Load all master data from API
   */
  loadMasters(): void {
    this.isLoadingMasters.set(true);
    
    this.propertyInspectionService.getMasters().subscribe({
      next: (response) => {
        if (response.success) {
          this.masters.set(response.data);
          console.log('✅ Masters loaded successfully:', response.data);
        }
        this.isLoadingMasters.set(false);
      },
      error: (error) => {
        console.error('❌ Error loading masters:', error);
        this.isLoadingMasters.set(false);
        alert('Failed to load form options. Please refresh the page.');
      }
    });
  }

  /**
   * Load property data for edit mode
   */
  loadPropertyData(): void {
    if (!this.propertyId) return;

    this.isLoadingProperty.set(true);
    
    this.propertyInspectionService.getInspection(this.propertyId).subscribe({
      next: (response) => {
        if (response.success) {
          this.populateFormData(response.data);
          console.log('✅ Property data loaded successfully:', response.data);
        }
        this.isLoadingProperty.set(false);
      },
      error: (error) => {
        console.error('❌ Error loading property:', error);
        this.isLoadingProperty.set(false);
        alert('Failed to load property data. Please try again.');
        this.router.navigate(['/property-list']);
      }
    });
  }

  /**
   * Populate form with existing property data
   */
  populateFormData(data: any): void {
    // Property Details
    this.propertyDetails.set({
      projectId: data.project_id || '',
      bank: data.bank || '',
      ownerName: data.owner_name || '',
      purposeOfInspection: this.getPurposeOfInspection(data),
      purposeValuation: data.purpose_valuation || false,
      purposeDueDiligence: data.purpose_due_diligence || false,
      purposeFeasibility: data.purpose_feasibility || false,
      address: data.site_address || '',
      personMet: data.person_met || '',
      contactNumber: data.contact_number || ''
    });

    // Land Particulars - Get master IDs and names
    this.landParticulars.set({
      shape: data.land_shape_master?.name || '',
      shapeId: data.land_shape || null,
      levelVsRoad: data.level_vs_road_master?.name || '',
      levelVsRoadId: data.level_vs_road || null,
      topography: data.topography_master?.name || '',
      topographyId: data.topography || null,
      soilType: data.soil_type_master?.name ? [data.soil_type_master.name] : [],
      soilTypeId: data.soil_type || null,
      waterStagnation: data.water_stagnation ? 'Yes' : 'No',
      remarks: data.land_remarks || ''
    });

    // Location Access
    if (data.location_access) {
      const loc = data.location_access;
      this.locationAccess.set({
        accessStatus: loc.access_status_master?.name || '',
        accessStatusId: loc.access_status || null,
        landlockDistance: loc.landlocked_distance || '',
        numberOfAccessRoads: loc.access_roads_count_master?.name || '',
        accessRoadsCountId: loc.access_roads_count || null,
        primaryRoadName: loc.primary_road_name || '',
        primaryRoadType: loc.primary_road_type_master?.name || '',
        primaryRoadTypeId: loc.primary_road_type || null,
        primaryRoadWidth: loc.primary_road_width || '',
        secondaryRoadName: loc.secondary_road_name || '',
        secondaryRoadType: loc.secondary_road_type_master?.name || '',
        secondaryRoadTypeId: loc.secondary_road_type || null,
        secondaryRoadWidth: loc.secondary_road_width || '',
        tertiaryRoadName: loc.tertiary_road_name || '',
        tertiaryRoadType: loc.tertiary_road_type_master?.name || '',
        tertiaryRoadTypeId: loc.tertiary_road_type || null,
        tertiaryRoadWidth: loc.tertiary_road_width || '',
        publicTransport: loc.public_transport ? loc.public_transport.split(',') : [],
        nearestTransportNode: loc.nearest_transport_node || '',
        neighbourhood: loc.neighbourhood_master?.name ? [loc.neighbourhood_master.name] : [],
        neighbourhoodId: loc.neighbourhood || null,
        developmentStatus: loc.development_status_master?.name || '',
        developmentStatusId: loc.development_status || null
      });
    }

    // Site Boundaries
    this.siteBoundaries.set({
      north: data.north_boundary || '',
      south: data.south_boundary || '',
      east: data.east_boundary || '',
      west: data.west_boundary || '',
      boundariesIdentified: data.boundaries_identified ? 'Yes' : 'No',
      boundary_demarcation: data.boundary_demarcation ? data.boundary_demarcation.split(',') : [],
      boundaryDetails: data.boundary_remarks || ''
    });

    // Other Observations
    this.otherObservations.set({
      roadWideninsSigns: data.road_widening_signs ? 'Yes' : 'No',
      highTensionLines: data.high_tension_lines_master?.name || '',
      highTensionLinesId: data.high_tension_lines || null,
      canalDrain: data.canal_drain_master?.name || '',
      canalDrainId: data.canal_drain || null,
      waterBodyNearby: data.water_body_nearby ? 'Yes' : 'No',
      otherRestrictions: data.other_restrictions || ''
    });

    // Summary
    if (data.summary) {
      this.summary.set({
        keyPositives: data.summary.key_positives || '',
        keyNegatives: data.summary.key_negatives || '',
        redFlags: data.summary.red_flags || ''
      });
    }

    // Photos - Note: You'll need to handle displaying existing photos
    // For now, we'll just log them
    if (data.photos && data.photos.length > 0) {
      console.log('📷 Existing photos:', data.photos);
      // You may want to display these in the UI but not include in uploadedPhotos
    }

    console.log('✅ Form populated with data');
  }

  /**
   * Helper to get purpose of inspection array
   */
  getPurposeOfInspection(data: any): string[] {
    const purposes: string[] = [];
    if (data.purpose_valuation) purposes.push('Valuation');
    if (data.purpose_due_diligence) purposes.push('Due Diligence');
    if (data.purpose_feasibility) purposes.push('Feasibility');
    return purposes;
  }

  /**
   * Validate mobile number (must be 10 digits)
   */
  validateMobileNumber(number: string): boolean {
    const mobileRegex = /^[0-9]{10}$/;
    return mobileRegex.test(number);
  }

  /**
   * Validate Step 1 (Property Details) - For Draft
   * Only validates: projectId, ownerName, address, contactNumber
   */
  validateStep1ForDraft(): boolean {
    const errors: ValidationErrors = {};
    const pd = this.propertyDetails();

    // Required fields for draft
    if (!pd.projectId || pd.projectId.trim() === '') {
      errors['projectId'] = 'Project ID is required';
    }

    if (!pd.ownerName || pd.ownerName.trim() === '') {
      errors['ownerName'] = 'Owner Name is required';
    }

    if (!pd.address || pd.address.trim() === '') {
      errors['address'] = 'Address is required';
    }

    // Contact number validation (always validate if provided)
    if (pd.contactNumber && pd.contactNumber.trim() !== '') {
      if (!this.validateMobileNumber(pd.contactNumber)) {
        errors['contactNumber'] = 'Contact number must be exactly 10 digits';
      }
    }

    this.validationErrors.set(errors);
    return Object.keys(errors).length === 0;
  }

  /**
   * Validate Step 1 (Property Details) - For Final Submission
   */
  validateStep1(): boolean {
    const errors: ValidationErrors = {};
    const pd = this.propertyDetails();

    // Project ID
    if (!pd.projectId || pd.projectId.trim() === '') {
      errors['projectId'] = 'Project ID is required';
    }

    // Owner Name
    if (!pd.ownerName || pd.ownerName.trim() === '') {
      errors['ownerName'] = 'Owner Name is required';
    }

    // Purpose of Inspection
    if (pd.purposeOfInspection.length === 0) {
      errors['purposeOfInspection'] = 'Please select at least one purpose';
    }

    // Address
    if (!pd.address || pd.address.trim() === '') {
      errors['address'] = 'Address is required';
    }

    // Contact Number (required for final submission)
    if (!pd.contactNumber || pd.contactNumber.trim() === '') {
      errors['contactNumber'] = 'Contact number is required';
    } else if (!this.validateMobileNumber(pd.contactNumber)) {
      errors['contactNumber'] = 'Contact number must be exactly 10 digits';
    }

    this.validationErrors.set(errors);
    return Object.keys(errors).length === 0;
  }

  /**
   * Validate Step 2 (Location & Access)
   */
  validateStep2(): boolean {
    const errors: ValidationErrors = {};
    const la = this.locationAccess();

    if (!la.accessStatusId) {
      errors['accessStatusId'] = 'Access Status is required';
    }

    if (!la.accessRoadsCountId) {
      errors['accessRoadsCountId'] = 'Number of Access Roads is required';
    }

    this.validationErrors.set(errors);
    return Object.keys(errors).length === 0;
  }

  /**
   * Validate Step 3 (Land Particulars)
   */
  validateStep3(): boolean {
    const errors: ValidationErrors = {};
    const lp = this.landParticulars();

    if (!lp.shapeId) {
      errors['shapeId'] = 'Land Shape is required';
    }

    if (!lp.levelVsRoadId) {
      errors['levelVsRoadId'] = 'Level vs Road is required';
    }

    if (!lp.topographyId) {
      errors['topographyId'] = 'Topography is required';
    }

    this.validationErrors.set(errors);
    return Object.keys(errors).length === 0;
  }

  /**
   * Validate Step 4 (Site Boundaries)
   */
  validateStep4(): boolean {
    const errors: ValidationErrors = {};
    const sb = this.siteBoundaries();

    if (!sb.north || sb.north.trim() === '') {
      errors['north'] = 'North boundary is required';
    }

    if (!sb.south || sb.south.trim() === '') {
      errors['south'] = 'South boundary is required';
    }

    if (!sb.east || sb.east.trim() === '') {
      errors['east'] = 'East boundary is required';
    }

    if (!sb.west || sb.west.trim() === '') {
      errors['west'] = 'West boundary is required';
    }

    this.validationErrors.set(errors);
    return Object.keys(errors).length === 0;
  }

  /**
   * Validate Step 6 (Photo Upload)
   */
  validateStep6(): boolean {
    const errors: ValidationErrors = {};

    if (this.uploadedPhotos().length < 5) {
      errors['photos'] = 'At least 5 photos are required';
    }

    this.validationErrors.set(errors);
    return Object.keys(errors).length === 0;
  }

  /**
   * Validate current step
   */
  validateCurrentStep(isDraft: boolean = false): boolean {
    // For draft, only validate step 1 with minimal validation
    if (isDraft) {
      return this.validateStep1ForDraft();
    }

    // For final submission, validate based on current step
    switch (this.currentStep()) {
      case 1:
        return this.validateStep1();
      case 2:
        return this.validateStep2();
      case 3:
        return this.validateStep3();
      case 4:
        return this.validateStep4();
      case 5:
        return true; // Optional section
      case 6:
        return this.validateStep6();
      case 7:
        return true; // Summary
      default:
        return true;
    }
  }

  /**
   * Validate all steps for final submission
   * Returns the first step number that has errors, or 0 if all valid
   */
  validateAllSteps(): number {
    // Validate each step and find first one with errors
    if (!this.validateStep1()) {
      return 1;
    }
    if (!this.validateStep2()) {
      return 2;
    }
    if (!this.validateStep3()) {
      return 3;
    }
    if (!this.validateStep4()) {
      return 4;
    }
    // Step 5 is optional
    if (!this.validateStep6()) {
      return 6;
    }
    // Step 7 is summary, no validation
    return 0; // All steps valid
  }

  /**
   * Determine which step an error field belongs to
   */
  getStepForError(fieldPath: string): number {
    // Step 1: Property Details
    if (fieldPath.includes('propertyDetails')) {
      return 1;
    }
    // Step 2: Location & Access
    if (fieldPath.includes('locationAccess')) {
      return 2;
    }
    // Step 3: Land Particulars
    if (fieldPath.includes('landParticulars')) {
      return 3;
    }
    // Step 4: Site Boundaries
    if (fieldPath.includes('siteBoundaries')) {
      return 4;
    }
    // Step 5: Other Observations
    if (fieldPath.includes('otherObservations')) {
      return 5;
    }
    // Step 6: Photos
    if (fieldPath.includes('photos')) {
      return 6;
    }
    // Default to current step
    return this.currentStep();
  }

  /**
   * Clear validation error for a specific field
   */
  clearError(fieldName: string): void {
    const errors = { ...this.validationErrors() };
    delete errors[fieldName];
    this.validationErrors.set(errors);
  }

  /**
   * Get validation error for a field
   */
  getError(fieldName: string): string {
    return this.validationErrors()[fieldName] || '';
  }

  /**
   * Check if field has error
   */
  hasError(fieldName: string): boolean {
    return !!this.validationErrors()[fieldName];
  }

  /**
   * Handle dropdown change to store both display value and ID
   */
  onMasterChange(field: string, selectedId: number, masterType: string): void {
    const mastersList = this.masters()[masterType];
    if (!mastersList) {
      console.error('Master type not found:', masterType);
      return;
    }

    const master = mastersList.find((m: Master) => m.id === selectedId);
    
    if (master) {
      // Update land particulars fields
      if (field === 'shape' || field === 'levelVsRoad' || field === 'topography' || field === 'soilType') {
        const current = this.landParticulars();
        this.landParticulars.set({
          ...current,
          [field]: master.name,
          [`${field}Id`]: master.id
        });
        
        // Clear validation error for this field
        this.clearError(`${field}Id`);
      } 
      // Update location access fields
      else if (field === 'accessStatus' || field === 'accessRoadsCount' || field === 'primaryRoadType' || 
               field === 'secondaryRoadType' || field === 'tertiaryRoadType' || 
               field === 'neighbourhood' || field === 'developmentStatus') {
        const current = this.locationAccess();
        this.locationAccess.set({
          ...current,
          [field]: master.name,
          [`${field}Id`]: master.id
        });
        
        // Clear validation error for this field
        this.clearError(`${field}Id`);
      } 
      // Update other observations fields
      else if (field === 'highTensionLines' || field === 'canalDrain') {
        const current = this.otherObservations();
        this.otherObservations.set({
          ...current,
          [field]: master.name,
          [`${field}Id`]: master.id
        });
      }

      console.log(`✅ Updated ${field}:`, master.name, `(ID: ${master.id})`);
    }
  }

  /**
   * Handle checkbox for purpose of inspection
   */
  updatePurposeCheckboxes(): void {
    const current = this.propertyDetails();
    this.propertyDetails.set({
      ...current,
      purposeValuation: current.purposeOfInspection.includes('Valuation'),
      purposeDueDiligence: current.purposeOfInspection.includes('Due Diligence'),
      purposeFeasibility: current.purposeOfInspection.includes('Feasibility')
    });
    
    // Clear validation error if at least one selected
    if (current.purposeOfInspection.length > 0) {
      this.clearError('purposeOfInspection');
    }
  }

  /**
   * Navigate to next step
   */
 nextStep(): void {
    if (this.currentStep() < this.totalSteps) {
      this.currentStep.set(this.currentStep() + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  /**
   * Scroll to first validation error and focus on the input
   */
  scrollToFirstError(): void {
    setTimeout(() => {
      // First try to find input with error class
      const errorInput = document.querySelector('input.error, textarea.error, select.error, .checkbox-group.error, .radio-group.error');
      
      if (errorInput) {
        // Scroll to the error input
        errorInput.scrollIntoView({ behavior: 'smooth', block: 'center' });
        
        // Focus on the input if it's a focusable element
        if (errorInput instanceof HTMLInputElement || 
            errorInput instanceof HTMLTextAreaElement || 
            errorInput instanceof HTMLSelectElement) {
          setTimeout(() => {
            errorInput.focus();
          }, 300); // Wait for scroll to complete
        } else if (errorInput.classList.contains('checkbox-group') || 
                   errorInput.classList.contains('radio-group')) {
          // For checkbox/radio groups, focus on the first input inside
          const firstInput = errorInput.querySelector('input');
          if (firstInput) {
            setTimeout(() => {
              firstInput.focus();
            }, 300);
          }
        }
      } else {
        // Fallback: scroll to error message if no input with error class found
        const errorMessage = document.querySelector('.error-message');
        if (errorMessage) {
          errorMessage.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
      }
    }, 100);
  }

  /**
   * Navigate to previous step
   */
  previousStep(): void {
    if (this.currentStep() > 1) {
      this.currentStep.set(this.currentStep() - 1);
      // Clear errors when going back
      this.validationErrors.set({});
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  }

  /**
   * Go to specific step
   */
  goToStep(step: number): void {
    this.currentStep.set(step);
    // Clear errors when changing steps
    this.validationErrors.set({});
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /**
   * Toggle checkbox value in array
   */
  toggleCheckbox(array: any[], value: string | number): void {
    const index = array.indexOf(value);
    if (index > -1) {
      array.splice(index, 1);
    } else {
      array.push(value);
    }
    
    // Update boolean flags if it's purpose checkboxes
    if (array === this.propertyDetails().purposeOfInspection) {
      this.updatePurposeCheckboxes();
    }
  }

  /**
   * Handle file selection for photo upload
   */
  onFileSelect(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files) {
      const newFiles = Array.from(input.files);
      this.uploadedPhotos.set([...this.uploadedPhotos(), ...newFiles]);
      console.log(`📷 ${newFiles.length} photo(s) added. Total: ${this.uploadedPhotos().length}`);
      
      // Clear photo validation error if enough photos uploaded
      if (this.uploadedPhotos().length >= 5) {
        this.clearError('photos');
      }
    }
  }

  /**
   * Remove photo at index
   */
  removePhoto(index: number): void {
    const photos = this.uploadedPhotos();
    photos.splice(index, 1);
    this.uploadedPhotos.set([...photos]);
    console.log(`🗑️ Photo removed. Remaining: ${this.uploadedPhotos().length}`);
  }

  /**
   * Submit the form
   */
  submitForm(isDraft: boolean = false): void {
    // For draft, only validate step 1
    if (isDraft) {
      if (!this.validateStep1ForDraft()) {
        // Navigate to step 1 if not already there
        if (this.currentStep() !== 1) {
          this.currentStep.set(1);
          // Don't clear errors, we want to keep them
          setTimeout(() => {
            this.scrollToFirstError();
          }, 100);
        } else {
          this.scrollToFirstError();
        }
        return;
      }
    } else {
      // For final submission, validate ALL steps
      const firstErrorStep = this.validateAllSteps();
      if (firstErrorStep > 0) {
        // Navigate to the step with errors
        this.currentStep.set(firstErrorStep);
        // Don't clear errors, we want to keep them
        setTimeout(() => {
          this.scrollToFirstError();
        }, 100);
        return;
      }
    }

    this.isSubmitting.set(true);
    this.submitError.set('');
    this.submitSuccess.set(false);

    // Prepare data to send
    const formData = {
      propertyId: this.propertyId, // Add property ID for UPDATE (null for CREATE)
      propertyDetails: this.propertyDetails(),
      locationAccess: this.locationAccess(),
      landParticulars: {
        ...this.landParticulars(),
        waterStagnation: this.landParticulars().waterStagnation === 'Yes'
      },
      siteBoundaries: {
        ...this.siteBoundaries(),
        boundariesIdentified: this.siteBoundaries().boundariesIdentified === 'Yes',
        boundaryDemarcation: this.siteBoundaries().boundary_demarcation.join(',')
      },
      otherObservations: {
        ...this.otherObservations(),
        roadWideninsSigns: this.otherObservations().roadWideninsSigns === 'Yes',
        waterBodyNearby: this.otherObservations().waterBodyNearby === 'Yes'
      },
      summary: this.summary(),
      photos: this.uploadedPhotos(),
      isDraft: isDraft ? 1 : 0  // Add draft flag: 1 for draft, 0 for final
    };

    console.log('📤 Submitting form data:', formData);
    console.log(this.isEditMode() ? '🔄 UPDATE mode' : '➕ CREATE mode');

    this.propertyInspectionService.saveInspection(formData).subscribe({
      next: (response) => {
        this.isSubmitting.set(false);
        console.log('✅ Form submitted successfully:', response);
        
        if (isDraft) {
          alert('✅ Draft saved successfully!');
          // Don't navigate away, let user continue editing
        } else {
          this.submitSuccess.set(true);
          const message = this.isEditMode() 
            ? '✅ Property inspection updated successfully!' 
            : '✅ Property inspection saved successfully!';
          alert(`${message}\nProject ID: ${response.data?.project_id}`);
          // Navigate to property-list after 1 second
          setTimeout(() => {
            this.router.navigate(['/property-list']);
          }, 1000);
        }
      },
      error: (error) => {
        this.isSubmitting.set(false);
        console.error('❌ Error saving inspection:', error);
        
        // Handle different error types
        if (error.status === 422 && error.error?.errors) {
          const apiErrors = error.error.errors;
          const validationErrorsMap: ValidationErrors = {};
  
          // Map API errors to validation errors for inline display
          Object.entries(apiErrors).forEach(([field, msgs]: [string, any]) => {
            // Clean up field names to match our form field names
            const cleanField = field
              .replace('propertyDetails.', '')
              .replace('locationAccess.', '')
              .replace('landParticulars.', '')
              .replace('siteBoundaries.', '')
              .replace('otherObservations.', '');
            
            // Set the error message
            validationErrorsMap[cleanField] = Array.isArray(msgs) ? msgs[0] : msgs;
          });
          
          // Set validation errors to display inline
          this.validationErrors.set(validationErrorsMap);
          
          // Determine which step has the first error and navigate to it
          const errorStep = this.getStepForError(Object.keys(apiErrors)[0]);
          if (errorStep > 0 && this.currentStep() !== errorStep) {
            this.currentStep.set(errorStep);
            // Wait for step change, then scroll to error
            setTimeout(() => {
              this.scrollToFirstError();
            }, 100);
          } else {
            // Already on the correct step, just scroll
            this.scrollToFirstError();
          }
        } else {
          // For other errors, show a generic message
          this.submitError.set('An error occurred while saving. Please try again.');
        }
      }
    });
  }

  /**
   * Cancel form and return to dashboard
   */
  cancelForm(): void {
    if (confirm('Are you sure you want to cancel? All unsaved data will be lost.')) {
      this.router.navigate(['/dashboard']);
    }
  }

  /**
   * Get step title by step number
   */
  getStepTitle(step: number): string {
    const titles = [
      'Property Details',
      'Location & Access',
      'Land Particulars',
      'Site Boundaries',
      'Other Observations',
      'Photo Upload',
      'Summary & Submit'
    ];
    return titles[step - 1] || '';
  }

  /**
   * Check if step is complete
   */
  isStepComplete(step: number): boolean {
    switch (step) {
      case 1:
        const pd = this.propertyDetails();
        return !!(pd.projectId && pd.ownerName && pd.address);
      case 2:
        const la = this.locationAccess();
        return !!(la.accessStatusId && la.accessRoadsCountId);
      case 3:
        const lp = this.landParticulars();
        return !!(lp.shapeId && lp.topographyId);
      case 4:
        const sb = this.siteBoundaries();
        return !!(sb.north && sb.south && sb.east && sb.west);
      case 5:
        return true; // Optional section
      case 6:
        return this.uploadedPhotos().length >= 5;
      case 7:
        return true;
      default:
        return false;
    }
  }

  /**
   * Get progress percentage
   */
  getProgressPercentage(): number {
    return (this.currentStep() / this.totalSteps) * 100;
  }

  /**
   * Helper method to get masters by type
   */
  getMasterOptions(type: string): Master[] {
    return this.masters()[type] || [];
  }
}