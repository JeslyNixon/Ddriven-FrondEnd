import { Component, OnInit, ViewChild, ElementRef } from '@angular/core';
import { Router } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ToastService } from '../../services/toast/toast';
import { DataService } from '../../services/data/data';
import { PermissionService } from '../../services/permission/permission';

interface Property {
  id: number;
  project_id: string;
  owner_name: string;
  bank: string;
  site_address: string;
  status: 'draft' | 'completed' | 'approved';
  inspection_date: string;
  created_at: string;
  updated_at: string;
}

@Component({
  selector: 'app-property-list',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './property-list.html',
  styleUrls: ['./property-list.scss']
})
export class PropertyListComponent implements OnInit {
  @ViewChild('signatureCanvas') signatureCanvas!: ElementRef<HTMLCanvasElement>;
  @ViewChild('signatureFileInput') signatureFileInput!: ElementRef<HTMLInputElement>;

  properties: Property[] = [];
  expandedRows: { [key: number]: boolean } = {};
  
  // Filters
  searchTerm: string = '';
  statusFilter: string = 'all';
  sortBy: string = 'created_at';
  sortOrder: 'asc' | 'desc' = 'desc';
  
  // Pagination - Server-side
  currentPage: number = 1;
  itemsPerPage: number = 10;
  totalPages: number = 1;
  totalItems: number = 0;
  
  // Loading state
  isLoading: boolean = false;
  
  // Bulk selection
  selectedProperties: Set<number> = new Set();
  isApproving: boolean = false;

  // Approval Modal
  showApprovalModal: boolean = false;
  approvalMode: 'single' | 'bulk' = 'single';
  selectedPropertyForApproval: Property | null = null;  
  showDeleteModal: boolean = false;
  
  // Inspector Declaration Form
  inspectorName: string = '';
  declarationAccepted: boolean = false;
  currentDate: string = new Date().toISOString().split('T')[0];
  
  // Signature
  signatureMode: 'draw' | 'upload' = 'draw';
  hasSignature: boolean = false;
  signatureDataUrl: string = '';
  uploadedSignaturePreview: string = '';
  uploadedSignatureFile: File | null = null;

   // Delete confirmation
  propertyToDelete: Property | null = null;
  
  // Canvas drawing
  private isDrawing: boolean = false;
  private ctx: CanvasRenderingContext2D | null = null;
  private lastX: number = 0;
  private lastY: number = 0;
  
  // Form Errors
  inspectorNameError: string = '';
  signatureError: string = '';
  declarationError: string = '';

  constructor(
    private router: Router,
    private dataService: DataService,
    private toastService:ToastService,
    public permissionService:PermissionService
  ) {}

  ngOnInit(): void {
    this.loadProperties();
  }

  loadProperties(): void {
    this.isLoading = true;
    
    const params = {
      page: this.currentPage,
      per_page: this.itemsPerPage,
      search: this.searchTerm,
      status: this.statusFilter !== 'all' ? this.statusFilter : '',
      sortBy:this.sortBy,
      sortOrder:this.sortOrder
    };
    
    
    this.dataService.getProperties(params).subscribe({
      next: (response: any) => {
        
        if (response && response.success && response.data) {
          const paginationData = response.data;
          
          // Extract property data
          this.properties = Array.isArray(paginationData.data) ? paginationData.data : [];
          
          // Extract pagination info from Laravel
          this.currentPage = paginationData.current_page || 1;
          this.totalPages = paginationData.last_page || 1;
          this.totalItems = paginationData.total || 0;
          this.itemsPerPage = paginationData.per_page || 10;
          
         
        } else {
          this.properties = [];
          this.resetPagination();
        }
        
        this.isLoading = false;
      },
      error: (error: any) => {
        this.properties = [];
        this.resetPagination();
        this.isLoading = false;
      }
    });
  }

  resetPagination(): void {
    this.currentPage = 1;
    this.totalPages = 1;
    this.totalItems = 0;
  }

  // Search and Filter - triggers new API call
  onSearch(): void {
    this.currentPage = 1;
    this.loadProperties();
  }

  onStatusFilterChange(): void {
    this.currentPage = 1;
    this.loadProperties();
  }

  onSortChange(): void {
    this.currentPage = 1;
    this.loadProperties();
  }

  toggleSortOrder(): void {
    this.sortOrder = this.sortOrder === 'asc' ? 'desc' : 'asc';
    this.currentPage = 1;
    this.loadProperties();
  }

  // Pagination
  nextPage(): void {
    if (this.currentPage < this.totalPages) {
      this.currentPage++;
      this.loadProperties();
    }
  }

  previousPage(): void {
    if (this.currentPage > 1) {
      this.currentPage--;
      this.loadProperties();
    }
  }

  goToPage(page: number): void {
    if (page >= 1 && page <= this.totalPages && page !== this.currentPage) {
      this.currentPage = page;
      this.loadProperties();
    }
  }

  get pageNumbers(): number[] {
    const pages: number[] = [];
    const maxVisible = 5;
    
    if (this.totalPages <= maxVisible) {
      return Array.from({ length: this.totalPages }, (_, i) => i + 1);
    }
    
    let startPage = Math.max(1, this.currentPage - 2);
    let endPage = Math.min(this.totalPages, this.currentPage + 2);
    
    if (this.currentPage <= 3) {
      endPage = maxVisible;
    }
    if (this.currentPage >= this.totalPages - 2) {
      startPage = this.totalPages - maxVisible + 1;
    }
    
    for (let i = startPage; i <= endPage; i++) {
      pages.push(i);
    }
    
    return pages;
  }

  get showingText(): string {
    if (this.totalItems === 0) return 'No properties';
    const from = ((this.currentPage - 1) * this.itemsPerPage) + 1;
    const to = Math.min(this.currentPage * this.itemsPerPage, this.totalItems);
    return `Showing ${from}-${to} of ${this.totalItems}`;
  }

  // Expand/Collapse
  toggleExpand(propertyId: number): void {
    this.expandedRows[propertyId] = !this.expandedRows[propertyId];
  }

  isExpanded(propertyId: number): boolean {
    return !!this.expandedRows[propertyId];
  }

  // CRUD Operations
  viewProperty(propertyId: number): void {
    this.router.navigate(['/property-inspection', propertyId]);
  }

  editProperty(propertyId: number): void {
	this.router.navigate(['/property-inspection/edit', propertyId]);
}

  createNewProperty(): void {
    this.router.navigate(['/property-inspection']);
  }

  // Status helpers
  getStatusClass(status: any): string {
    const name = this.getStatusName(status).toLowerCase();
    if (!name) return '';

    const classes: Record<string, string> = {
      draft: 'draft',
      completed: 'completed',
      approved: 'approved',
      pending: 'pending',
      in_progress: 'in-progress',
      cancelled: 'cancelled'
    };

    return classes[name] || '';
  }

  getStatusLabel(status: any): string {
    const name = this.getStatusName(status);
    if (!name) return 'N/A';

    const labels: Record<string, string> = {
      draft: 'Draft',
      completed: 'Completed',
      approved: 'Approved',
      pending: 'Pending',
      in_progress: 'In Progress',
      cancelled: 'Cancelled'
    };

    return labels[name.toLowerCase()] || name;
  }

  getStatusName(status: any): string {
    if (!status) return '';
    return typeof status === 'object' && status.name ? status.name : String(status);
  }

  // Export Functions
  exportToExcel(): void {
    const params = {
      status: this.statusFilter !== 'all' ? this.statusFilter : '',
      sortBy: this.sortBy,
      sortOrder: this.sortOrder
    };
    this.dataService.exportProperties(params).subscribe({
      next: (response: any) => {
        const blob = new Blob([response], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
        const link = document.createElement('a');
        link.href = window.URL.createObjectURL(blob);
        link.download = `proerties_export_${new Date().toISOString()}.xlsx`;
        link.click();
      },
      error: (err: any) => {
        this.toastService.show('Export failed. Please try again.', 'error');
      },
    });
  }

  exportToPDF(): void {
    this.isLoading = true;

    const params = {
      status: this.statusFilter !== 'all' ? this.statusFilter : '',
      sortBy: this.sortBy,
      sortOrder: this.sortOrder
    };


    this.dataService.getPropertiesPdf(params).subscribe({
      next: (response: Blob) => {
        const fileURL = window.URL.createObjectURL(response);
        this.openPdfModal(fileURL);
        this.isLoading = false;
      },
      error: (error) => {        
        this.toastService.show('Export PDF failed. Please try again.', 'error');
        this.isLoading = false;
      }
    });
  }

  openPdfModal(pdfUrl: string): void {
    
    const modal = document.createElement('div');
    modal.className = 'pdf-modal';
    modal.style.cssText = `
      position: fixed;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.8);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 9999;
    `;
    
    const modalContent = document.createElement('div');
    modalContent.className = 'pdf-modal-content';
    modalContent.style.cssText = `
      position: relative;
      width: 90%;
      height: 90%;
      max-width: 1200px;
      background: white;
      border-radius: 8px;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
    `;
    
    const closeBtn = document.createElement('button');
    closeBtn.className = 'pdf-modal-close';
    closeBtn.innerHTML = '&times;';
    closeBtn.style.cssText = `
      position: absolute;
      top: 10px;
      right: 10px;
      background: #f44336;
      color: white;
      border: none;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      font-size: 24px;
      line-height: 1;
      cursor: pointer;
      z-index: 10;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 8px rgba(0, 0, 0, 0.2);
    `;
    closeBtn.onclick = () => this.closePdfModal(modal, pdfUrl);
    
    closeBtn.onmouseenter = () => {
      closeBtn.style.background = '#d32f2f';
      closeBtn.style.transform = 'scale(1.1)';
    };
    closeBtn.onmouseleave = () => {
      closeBtn.style.background = '#f44336';
      closeBtn.style.transform = 'scale(1)';
    };
    
    const iframe = document.createElement('iframe');
    iframe.src = pdfUrl;
    iframe.className = 'pdf-iframe';
    iframe.style.cssText = `
      width: 100%;
      height: 100%;
      border: none;
    `;
    
    modalContent.appendChild(closeBtn);
    modalContent.appendChild(iframe);
    modal.appendChild(modalContent);
    document.body.appendChild(modal);
    
    modal.onclick = (e) => {
      if (e.target === modal) {
        this.closePdfModal(modal, pdfUrl);
      }
    };
    
    const escHandler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        this.closePdfModal(modal, pdfUrl);
        document.removeEventListener('keydown', escHandler);
      }
    };
    document.addEventListener('keydown', escHandler);
  }

  closePdfModal(modal: HTMLElement, pdfUrl: string): void {
    document.body.removeChild(modal);
    window.URL.revokeObjectURL(pdfUrl);
  }

  // Bulk Selection Methods
  toggleSelectAll(): void {
    const completedProperties = this.getCompletedProperties();
    
    if (this.isAllSelected()) {
      completedProperties.forEach(prop => this.selectedProperties.delete(prop.id));
    } else {
      completedProperties.forEach(prop => this.selectedProperties.add(prop.id));
    }
  }

  toggleSelectProperty(propertyId: number): void {
    if (this.selectedProperties.has(propertyId)) {
      this.selectedProperties.delete(propertyId);
    } else {
      this.selectedProperties.add(propertyId);
    }
  }

  isPropertySelected(propertyId: number): boolean {
    return this.selectedProperties.has(propertyId);
  }

  isAllSelected(): boolean {
    const completedProperties = this.getCompletedProperties();
    if (completedProperties.length === 0) return false;
    return completedProperties.every(prop => this.selectedProperties.has(prop.id));
  }

  isSomeSelected(): boolean {
    const completedProperties = this.getCompletedProperties();
    if (completedProperties.length === 0) return false;
    const selectedCount = completedProperties.filter(prop => this.selectedProperties.has(prop.id)).length;
    return selectedCount > 0 && selectedCount < completedProperties.length;
  }

  getCompletedProperties(): Property[] {
    return this.properties.filter(prop => {
      const statusName = this.getStatusName(prop.status).toLowerCase();
      return statusName === 'completed';
    });
  }

  get selectedCount(): number {
    return this.selectedProperties.size;
  }

  canShowCheckboxes(): boolean {
    return this.getCompletedProperties().length > 0;
  }

  isPropertyCompleted(property: Property): boolean {
    const statusName = this.getStatusName(property.status).toLowerCase();
    return statusName === 'completed';
  }

  // Approval Modal Methods
  openSingleApprovalModal(property: Property): void {
    this.approvalMode = 'single';
    this.selectedPropertyForApproval = property;
    this.resetApprovalForm();
    this.showApprovalModal = true;
    // Initialize canvas after view is ready
    setTimeout(() => this.initializeCanvas(), 100);
  }

  openBulkApprovalModal(): void {
    if (this.selectedProperties.size === 0) {
      this.toastService.show('Please select at least one property to approve', 'warning');
      return;
    }
    
    this.approvalMode = 'bulk';
    this.selectedPropertyForApproval = null;
    this.resetApprovalForm();
    this.showApprovalModal = true;
    // Initialize canvas after view is ready
    setTimeout(() => this.initializeCanvas(), 100);
  }

  closeApprovalModal(): void {
    if (!this.isApproving) {
      this.showApprovalModal = false;
      this.resetApprovalForm();
    }
  }

  resetApprovalForm(): void {
    this.inspectorName = '';
    this.declarationAccepted = false;
    this.inspectorNameError = '';
    this.signatureError = '';
    this.declarationError = '';
    this.currentDate = new Date().toISOString().split('T')[0];
    this.signatureMode = 'draw';
    this.hasSignature = false;
    this.signatureDataUrl = '';
    this.uploadedSignaturePreview = '';
    this.uploadedSignatureFile = null;
  }

  // Signature Canvas Methods
  initializeCanvas(): void {
    if (!this.signatureCanvas) return;
    
    const canvas = this.signatureCanvas.nativeElement;
    this.ctx = canvas.getContext('2d');
    
    if (!this.ctx) return;
    
    // Set canvas size
    canvas.width = canvas.offsetWidth;
    canvas.height = 200;
    
    // Configure context
    this.ctx.strokeStyle = '#000000';
    this.ctx.lineWidth = 2;
    this.ctx.lineCap = 'round';
    this.ctx.lineJoin = 'round';
    
    // Fill with white background
    this.ctx.fillStyle = '#ffffff';
    this.ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  setSignatureMode(mode: 'draw' | 'upload'): void {
    this.signatureMode = mode;
    this.clearSignature();
    if (mode === 'draw') {
      setTimeout(() => this.initializeCanvas(), 50);
    }
  }

  startDrawing(event: MouseEvent | TouchEvent): void {
    if (!this.ctx) return;
    
    this.isDrawing = true;
    const coords = this.getCoordinates(event);
    this.lastX = coords.x;
    this.lastY = coords.y;
    
    // Start a new path
    this.ctx.beginPath();
    this.ctx.moveTo(this.lastX, this.lastY);
  }

  draw(event: MouseEvent | TouchEvent): void {
    if (!this.isDrawing || !this.ctx) return;
    
    event.preventDefault();
    
    const coords = this.getCoordinates(event);
    
    this.ctx.lineTo(coords.x, coords.y);
    this.ctx.stroke();
    
    this.lastX = coords.x;
    this.lastY = coords.y;
    
    this.hasSignature = true;
  }

  stopDrawing(): void {
    if (!this.isDrawing) return;
    
    this.isDrawing = false;
    
    if (this.hasSignature && this.signatureCanvas) {
      // Save signature as data URL
      this.signatureDataUrl = this.signatureCanvas.nativeElement.toDataURL('image/png');
    }
  }

  getCoordinates(event: MouseEvent | TouchEvent): { x: number; y: number } {
    const canvas = this.signatureCanvas.nativeElement;
    const rect = canvas.getBoundingClientRect();
    
    if (event instanceof MouseEvent) {
      return {
        x: event.clientX - rect.left,
        y: event.clientY - rect.top
      };
    } else {
      // Touch event
      const touch = event.touches[0];
      return {
        x: touch.clientX - rect.left,
        y: touch.clientY - rect.top
      };
    }
  }

  clearSignature(): void {
    if (this.signatureMode === 'draw') {
      // Clear canvas
      if (this.ctx && this.signatureCanvas) {
        const canvas = this.signatureCanvas.nativeElement;
        this.ctx.fillStyle = '#ffffff';
        this.ctx.fillRect(0, 0, canvas.width, canvas.height);
      }
      this.hasSignature = false;
      this.signatureDataUrl = '';
    } else {
      // Clear uploaded file
      this.uploadedSignaturePreview = '';
      this.uploadedSignatureFile = null;
      if (this.signatureFileInput) {
        this.signatureFileInput.nativeElement.value = '';
      }
    }
    this.signatureError = '';
  }

  onSignatureFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    
    if (!input.files || input.files.length === 0) return;
    
    const file = input.files[0];
    
    // Validate file type
    if (!file.type.match(/image\/(png|jpeg|jpg)/)) {
      this.signatureError = 'Please upload a PNG or JPG image';
      return;
    }
    
    // Validate file size (2MB max)
    if (file.size > 2 * 1024 * 1024) {
      this.signatureError = 'File size must be less than 2MB';
      return;
    }
    
    this.uploadedSignatureFile = file;
    
    // Create preview
    const reader = new FileReader();
    reader.onload = (e: ProgressEvent<FileReader>) => {
      if (e.target?.result) {
        this.uploadedSignaturePreview = e.target.result as string;
        this.signatureError = '';
      }
    };
    reader.readAsDataURL(file);
  }

  validateApprovalForm(): boolean {
    let isValid = true;
    
    // Reset errors
    this.inspectorNameError = '';
    this.signatureError = '';
    this.declarationError = '';

    // Validate inspector name
    if (!this.inspectorName || this.inspectorName.trim() === '') {
      this.inspectorNameError = 'Inspector name is required';
      isValid = false;
    } else if (this.inspectorName.trim().length < 3) {
      this.inspectorNameError = 'Please enter a valid full name';
      isValid = false;
    }

    // Validate signature
    const hasDrawnSignature = this.signatureMode === 'draw' && this.hasSignature;
    const hasUploadedSignature = this.signatureMode === 'upload' && this.uploadedSignaturePreview;
    
    if (!hasDrawnSignature && !hasUploadedSignature) {
      this.signatureError = 'Please provide your signature';
      isValid = false;
    }

    // Validate declaration checkbox
    if (!this.declarationAccepted) {
      this.declarationError = 'You must accept the declaration to proceed';
      isValid = false;
    }

    return isValid;
  }

  confirmApproval(): void {
    if (!this.validateApprovalForm()) {
      return;
    }

    if (this.approvalMode === 'single') {
      this.executeSingleApproval();
    } else {
      this.executeBulkApproval();
    }
  }

  executeSingleApproval(): void {
    if (!this.selectedPropertyForApproval) return;

    this.isApproving = true;
    
    // Get signature based on mode
    const signatureData = this.signatureMode === 'draw' 
      ? this.signatureDataUrl 
      : this.uploadedSignaturePreview;
    
    const params = {
      id: this.selectedPropertyForApproval.id,
      inspector_name: this.inspectorName.trim(),
      inspection_date: this.currentDate,
      declaration_accepted: this.declarationAccepted,
      signature: signatureData,
      signature_type: this.signatureMode
    };
    
    this.dataService.approveProperty(params).subscribe({
      next: (response: any) => {
        if (response && response.success) {
          
          this.isApproving = false;
         this.toastService.show('Property approved successfully!');
          this.closeApprovalModal();
          this.loadProperties();
        } else {         
        this.toastService.show('Failed to approve property.', 'error');
        }
        this.isApproving = false;
      },
      error: (error: any) => {
        
        this.toastService.show('Failed to approve property. Please try again.', 'error');
        this.isApproving = false;
      }
    });
  }

  executeBulkApproval(): void {
    this.isApproving = true;
    
    // Get signature based on mode
    const signatureData = this.signatureMode === 'draw' 
      ? this.signatureDataUrl 
      : this.uploadedSignaturePreview;
    
    const params = {
      property_ids: Array.from(this.selectedProperties),
      inspector_name: this.inspectorName.trim(),
      inspection_date: this.currentDate,
      declaration_accepted: this.declarationAccepted,
      signature: signatureData,
      signature_type: this.signatureMode
    };
    
    const count = this.selectedProperties.size;
    
    this.dataService.bulkApproveProperties(params).subscribe({
      next: (response: any) => {
        if (response && response.success) {
          
          this.isApproving = false;
          this.toastService.show(`${count} ${count === 1 ? 'property' : 'properties'} approved successfully!`);
          this.selectedProperties.clear();
          this.closeApprovalModal();
          this.loadProperties();
        } else {
          this.toastService.show('Failed to approve properties.', 'error');
        }
        this.isApproving = false;
      },
      error: (error: any) => {
       this.toastService.show('Failed to approve properties. Please try again.', 'error');
        this.isApproving = false;
      }
    });
  }

  clearSelection(): void {
    this.selectedProperties.clear();
  }

  // Legacy approval methods (kept for backward compatibility)
  approveProperty(propertyId: number): void {
    const property = this.properties.find(p => p.id === propertyId);
    if (property) {
      this.openSingleApprovalModal(property);
    }
  }

  bulkApprove(): void {
    this.openBulkApprovalModal();
  }
   // Delete 
  openDeleteModal(property: Property): void {
    this.propertyToDelete = property;
    this.showDeleteModal = true;
  }

  closeDeleteModal(): void {
    this.showDeleteModal = false;
    this.propertyToDelete = null;
  }

  confirmDelete(): void {
    if (!this.propertyToDelete) return;

    const params = {
      id: this.propertyToDelete.id
    };

    this.dataService.deleteProperty(params).subscribe({
      next: (response: any) => {
        if (response && response.success) {
          this.toastService.show('Property deleted successfully!');
          this.closeDeleteModal();
          this.loadProperties();
        } else {
          this.toastService.show('Failed to delete property', 'error');
        }
      },
      error: (error: any) => {
        this.toastService.show('Failed to delete property', 'error');
      }
    });
  }

}