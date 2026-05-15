// xml-reader.component.ts
import { Component, signal, WritableSignal, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HttpClient } from '@angular/common/http';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

export interface XmlData {
  title: string;
  items: any[];
  rawXml: string;
}

@Component({
  selector: 'app-xml-reader',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: `
    <div class="xml-reader-container">
      <h2>XML Data Reader</h2>
      
      <!-- File Upload Section -->
      <div class="upload-section">
        <label for="xmlFile" class="upload-label">
          Choose XML File
          <input 
            type="file" 
            id="xmlFile" 
            (change)="onFileSelected($event)" 
            accept=".xml"
            class="file-input"
          >
        </label>
        
        <button 
          *ngIf="hasFile()" 
          (click)="clearData()" 
          class="clear-btn">
          Clear Data
        </button>
      </div>

      <!-- Loading State -->
      @if (isLoading()) {
        <div class="loading">
          <div class="spinner"></div>
          <p>Loading XML data...</p>
        </div>
      }

      <!-- Error Message -->
      @if (errorMessage()) {
        <div class="error-message">
          <strong>Error:</strong> {{ errorMessage() }}
        </div>
      }

      <!-- XML Content Preview -->
      @if (xmlContent()) {
        <div class="xml-preview">
          <h3>XML Content Preview</h3>
          <pre>{{ xmlContent() }}</pre>
        </div>
      }

      <!-- Parsed Data Display -->
      @if (parsedData()) {
        <div class="parsed-data">
          <h3>Parsed XML Data</h3>
          
          <!-- Display as JSON -->
          <div class="json-view">
            <pre>{{ parsedData() | json }}</pre>
          </div>

          <!-- Display as Formatted Table (if applicable) -->
          @if (getTableData().length > 0) {
            <div class="table-view">
              <h4>Table View</h4>
              <div class="table-container">
                <table>
                  <thead>
                    <tr>
                      @for (header of getTableHeaders(); track header) {
                        <th>{{ header }}</th>
                      }
                    </tr>
                  </thead>
                  <tbody>
                    @for (row of getTableData(); track $index) {
                      <tr>
                        @for (header of getTableHeaders(); track header) {
                          <td>{{ row[header] || '-' }}</td>
                        }
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            </div>
          }
        </div>
      }

      <!-- Stats -->
      @if (stats()) {
        <div class="stats">
          <h3>Statistics</h3>
          <p>File size: {{ stats()?.fileSize }} bytes</p>
          <p>Elements count: {{ stats()?.elementsCount }}</p>
          <p>Parsing time: {{ stats()?.parseTime }}ms</p>
        </div>
      }
    </div>
  `,
  styles: [`
    .xml-reader-container {
      max-width: 1200px;
      margin: 20px auto;
      padding: 20px;
      font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    }

    h2, h3, h4 {
      color: #333;
      margin-bottom: 15px;
    }

    .upload-section {
      margin-bottom: 20px;
      display: flex;
      gap: 15px;
      align-items: center;
    }

    .upload-label {
      display: inline-block;
      padding: 10px 20px;
      background: #007bff;
      color: white;
      border-radius: 5px;
      cursor: pointer;
      transition: background 0.3s;
    }

    .upload-label:hover {
      background: #0056b3;
    }

    .file-input {
      display: none;
    }

    .clear-btn {
      padding: 10px 20px;
      background: #dc3545;
      color: white;
      border: none;
      border-radius: 5px;
      cursor: pointer;
      transition: background 0.3s;
    }

    .clear-btn:hover {
      background: #c82333;
    }

    .loading {
      text-align: center;
      padding: 40px;
    }

    .spinner {
      border: 3px solid #f3f3f3;
      border-top: 3px solid #007bff;
      border-radius: 50%;
      width: 40px;
      height: 40px;
      animation: spin 1s linear infinite;
      margin: 0 auto 15px;
    }

    @keyframes spin {
      0% { transform: rotate(0deg); }
      100% { transform: rotate(360deg); }
    }

    .error-message {
      background: #f8d7da;
      color: #721c24;
      padding: 12px;
      border-radius: 5px;
      margin-bottom: 20px;
      border: 1px solid #f5c6cb;
    }

    .xml-preview {
      background: #f4f4f4;
      padding: 15px;
      border-radius: 5px;
      margin-bottom: 20px;
      overflow-x: auto;
    }

    .xml-preview pre {
      margin: 0;
      font-size: 12px;
      line-height: 1.5;
      color: #333;
    }

    .parsed-data {
      margin-bottom: 20px;
    }

    .json-view {
      background: #2d2d2d;
      color: #f8f8f2;
      padding: 15px;
      border-radius: 5px;
      margin-bottom: 20px;
      overflow-x: auto;
    }

    .json-view pre {
      margin: 0;
      font-size: 12px;
      line-height: 1.5;
    }

    .table-view {
      background: white;
      border: 1px solid #ddd;
      border-radius: 5px;
      overflow: hidden;
    }

    .table-container {
      overflow-x: auto;
      max-height: 500px;
      overflow-y: auto;
    }

    table {
      width: 100%;
      border-collapse: collapse;
    }

    th, td {
      padding: 12px;
      text-align: left;
      border-bottom: 1px solid #ddd;
    }

    th {
      background: #f8f9fa;
      font-weight: 600;
      position: sticky;
      top: 0;
      z-index: 10;
    }

    tr:hover {
      background: #f5f5f5;
    }

    .stats {
      background: #e9ecef;
      padding: 15px;
      border-radius: 5px;
    }

    .stats p {
      margin: 5px 0;
      color: #495057;
    }

    button {
      font-size: 14px;
    }
  `]
})
export class XmlReaderComponent {
  private http = inject(HttpClient);
  
  // Signals for reactive state management
  isLoading = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  xmlContent = signal<string | null>(null);
  parsedData = signal<any | null>(null);
  hasFile = signal<boolean>(false);
  stats = signal<{ fileSize: number; elementsCount: number; parseTime: number } | null>(null);

  /**
   * Handle file selection from input
   */
  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      this.readXmlFile(file);
    }
  }

  // Add this method to the component
loadXmlFromUrl(url: string): void {
  this.isLoading.set(true);
  this.errorMessage.set(null);
  
  const startTime = performance.now();
  
  this.http.get(url, { responseType: 'text' }).subscribe({
    next: (xmlString) => {
      this.xmlContent.set(xmlString);
      this.parseXmlString(xmlString, xmlString.length, startTime);
    },
    error: (error) => {
      this.isLoading.set(false);
      this.errorMessage.set(`Failed to load XML from URL: ${error.message}`);
    }
  });
}

  /**
   * Read XML file and parse its content
   */
  private readXmlFile(file: File): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.stats.set(null);
    
    const startTime = performance.now();
    
    const reader = new FileReader();
    
    reader.onload = (e: ProgressEvent<FileReader>) => {
      const xmlString = e.target?.result as string;
      this.xmlContent.set(xmlString);
      
      // Parse XML
      this.parseXmlString(xmlString, file.size, startTime);
    };
    
    reader.onerror = () => {
      this.isLoading.set(false);
      this.errorMessage.set('Error reading file. Please try again.');
    };
    
    reader.readAsText(file);
    this.hasFile.set(true);
  }

  /**
   * Parse XML string to JavaScript object
   */
  private parseXmlString(xmlString: string, fileSize: number, startTime: number): void {
    try {
      const parser = new DOMParser();
      const xmlDoc = parser.parseFromString(xmlString, 'text/xml');
      
      // Check for parsing errors
      const parserError = xmlDoc.querySelector('parsererror');
      if (parserError) {
        throw new Error('Invalid XML format');
      }
      
      // Convert XML to JavaScript object
      const parsedObject = this.xmlToJson(xmlDoc.documentElement);
      
      // Calculate parsing time
      const parseTime = performance.now() - startTime;
      
      // Count elements
      const elementsCount = xmlDoc.getElementsByTagName('*').length;
      
      // Update signals
      this.parsedData.set(parsedObject);
      this.stats.set({
        fileSize,
        elementsCount,
        parseTime: Math.round(parseTime)
      });
      
      this.isLoading.set(false);
      
    } catch (error) {
      this.isLoading.set(false);
      this.errorMessage.set(`Failed to parse XML: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Convert XML DOM element to JavaScript object recursively
   */
  private xmlToJson(node: Element): any {
    const obj: any = {};
    
    // Add attributes
    if (node.attributes && node.attributes.length > 0) {
      obj['@attributes'] = {};
      for (let i = 0; i < node.attributes.length; i++) {
        const attribute = node.attributes[i];
        obj['@attributes'][attribute.name] = attribute.value;
      }
    }
    
    // Process child nodes
    if (node.children.length === 0) {
      // Leaf node - return text content
      return node.textContent?.trim() || '';
    }
    
    // Process child elements
    for (let i = 0; i < node.children.length; i++) {
      const childNode = node.children[i];
      const childName = childNode.nodeName;
      const childValue = this.xmlToJson(childNode);
      
      if (obj[childName]) {
        // Multiple elements with same name - convert to array
        if (Array.isArray(obj[childName])) {
          obj[childName].push(childValue);
        } else {
          obj[childName] = [obj[childName], childValue];
        }
      } else {
        obj[childName] = childValue;
      }
    }
    
    return obj;
  }

  /**
   * Extract table headers from parsed data
   */
  getTableHeaders(): string[] {
    const data = this.parsedData();
    if (!data) return [];
    
    // Try to find an array of items to display as table
    const tableData = this.extractTableData(data);
    if (tableData.length > 0 && typeof tableData[0] === 'object') {
      return Object.keys(tableData[0]);
    }
    
    return [];
  }

  /**
   * Extract table data from parsed XML
   */
  getTableData(): any[] {
    const data = this.parsedData();
    if (!data) return [];
    
    return this.extractTableData(data);
  }

  /**
   * Recursively extract array data suitable for table display
   */
  private extractTableData(obj: any): any[] {
    if (Array.isArray(obj)) {
      return obj;
    }
    
    if (obj && typeof obj === 'object') {
      for (const key in obj) {
        const value = obj[key];
        if (Array.isArray(value)) {
          return value;
        }
        const nested = this.extractTableData(value);
        if (nested.length > 0) {
          return nested;
        }
      }
    }
    
    return [];
  }

  /**
   * Clear all data
   */
  clearData(): void {
    this.xmlContent.set(null);
    this.parsedData.set(null);
    this.errorMessage.set(null);
    this.stats.set(null);
    this.hasFile.set(false);
    this.isLoading.set(false);
  }
}