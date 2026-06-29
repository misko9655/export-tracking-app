import { Component, effect, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule } from '@angular/forms';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Repro } from '../../models/repro.model';
import { RawMaterialsService } from '../../services/raw-materials.service';
import { MatTableModule } from '@angular/material/table';
import { MatIconModule } from '@angular/material/icon';


@Component({
  selector: 'app-raw-materials',
  imports: [
    MatButtonModule,
    MatFormFieldModule,
    ReactiveFormsModule,
    MatInputModule,
    MatTableModule,
    MatIconModule,

  ],
  templateUrl: './raw-materials.html',
  styleUrl: './raw-materials.scss',
})
export class RawMaterials {


  reproItems = signal<Repro[]>([]);
  rawMaterialsService = inject(RawMaterialsService);
  fb = inject(FormBuilder);
  form = this.fb.group({
    reproCode: [''],
    quantity: [],
  });

  displayedColumns = [
    'reproCode',
    'reproName',
    'unitOfMeasure',
    'quantity'
  ]

  constructor() {
    effect(() => {
      console.log(`Repro materials: ${this.reproItems()}`);
    })

    this.loadRawMaterials()
      .then(() => { console.log('Repro materials loaded successfully', this.reproItems()) });
  }

  async loadRawMaterials() {
    try {
      const rawMaterials = await this.rawMaterialsService.findAllRawMaterials();
      this.reproItems.set(rawMaterials);
    }
    catch (error) {
      console.error('Error loading repro materials: ', error);
    }
  }

  onSave() {
    const rawItemProps = this.form.value as Partial<Repro>;
    rawItemProps.reproCode = rawItemProps.reproCode?.trim();
    const reproExist = this.reproItems().find(item => item.reproCode === rawItemProps.reproCode);
    if (reproExist) {
      this.updateReproItem(reproExist.id, rawItemProps);
    } else {
      this.createReproItem(rawItemProps);
    }
    this.form.reset();

  }

  async createReproItem(reproItem: Partial<Repro>) {
    try {
      const createdReproItem = await this.rawMaterialsService.createRepro(reproItem);
      console.log('Created repro item:', createdReproItem);
      if (createdReproItem) {
        const newItems = [...this.reproItems(), createdReproItem];
        this.reproItems.set(newItems);
        this.form.reset();
      }
    }
    catch (error) {
      console.error('Error creating repro item:', error);
      alert('Došlo je do greške prilikom kreiranja repromaterijala. Molimo pokušajte ponovo.');
    }
  }

  async updateReproItem(reproItemId: string, changes: Partial<Repro>) {
    try {
      const updatedReproItem = await this.rawMaterialsService.updateRepro(reproItemId, changes);
      console.log('Updated repro item:', updatedReproItem);
      if (updatedReproItem) {
        const tempReproItems = this.reproItems();
        const newReproItems = tempReproItems.map(item => (
          item.id === updatedReproItem.id ? updatedReproItem : item
        ));
        this.reproItems.set(newReproItems);
      }
    }
    catch (error) {
      console.error('Error updating repro item', error);
      alert('Doslo je do greške prilikom ažuriranja repromaterijala. Molimo pokušajte ponovo.');
    }
  }

  selectedFileName: string = '';

async onFileSelected(event: any): Promise<void> {
  const file = event.target.files[0];
  
  if (!file) {
    console.warn('No file selected');
    return;
  }
  
  this.selectedFileName = file.name;
  console.log('File selected:', file.name);
  
  // Check file extension for XML
  const validExtensions = ['.xml'];
  const fileExtension = file.name.substring(file.name.lastIndexOf('.')).toLowerCase();
  
  if (!validExtensions.includes(fileExtension)) {
    console.error('Invalid file type. Please select .xml file');
    alert('Molimo vas da odaberete validan XML fajl (.xml)');
    return;
  }
  
  try {
    // Read the file as text
    const text = await file.text();
    console.log('=== XML FILE CONTENT ===');
    console.log('File content as text:', text);
    
    // Parse XML to DOM
    const parser = new DOMParser();
    const xmlDoc = parser.parseFromString(text, 'text/xml');
    
    // Check for parsing errors
    const parserError = xmlDoc.querySelector('parsererror');
    if (parserError) {
      console.error('XML parsing error:', parserError.textContent);
      alert('Greška pri parsiranju XML fajla');
      return;
    }
    
    console.log('=== PARSED XML DOCUMENT ===');
    console.log('XML Document:', xmlDoc);
    
    // Get root element
    const rootElement = xmlDoc.documentElement;
    console.log('Root element name:', rootElement.nodeName);
    
    // Get all child elements
    const children = rootElement.children;
    console.log('Number of child elements:', children.length);
    
    // Convert XML to JavaScript object
    const jsonData = this.xmlToJson(rootElement);
    console.log('=== CONVERTED JSON DATA ===');
    console.log('JSON object:', jsonData);
    
    // Display each child element
    for (let i = 0; i < children.length; i++) {
      const child = children[i] as Element;
      console.log(`Element ${i + 1}:`, {
        name: child.nodeName,
        attributes: this.getAttributes(child),
        content: child.textContent?.trim()
      });
    }
    
    // Display summary
    console.log('=== IMPORT SUMMARY ===', {
      fileName: file.name,
      fileSize: file.size,
      rootElement: rootElement.nodeName,
      totalElements: children.length,
      xmlValid: true
    });
    
    alert(`Uspešno učitan XML fajl: ${file.name}. Pogledajte console log za detalje.`);
    
  } catch (error) {
    console.error('Error reading XML file:', error);
    alert('Greška pri čitanju XML fajla');
    this.clearFile();
  }
}

// Helper method to convert XML element to JSON
private xmlToJson(element: Element): any {
  const result: any = {};
  
  // Add attributes
  if (element.attributes.length > 0) {
    result['@attributes'] = {};
    for (let i = 0; i < element.attributes.length; i++) {
      const attr = element.attributes[i];
      result['@attributes'][attr.name] = attr.value;
    }
  }
  
  // Process child nodes
  if (element.children.length === 0) {
    // Leaf node - return text content
    return element.textContent?.trim() || '';
  }
  
  // Process child elements
  for (let i = 0; i < element.children.length; i++) {
    const child = element.children[i];
    const nodeName = child.nodeName;
    const childValue = this.xmlToJson(child);
    
    if (result[nodeName]) {
      if (!Array.isArray(result[nodeName])) {
        result[nodeName] = [result[nodeName]];
      }
      result[nodeName].push(childValue);
    } else {
      result[nodeName] = childValue;
    }
  }
  
  return result;
}

// Helper method to get attributes as object
private getAttributes(element: Element): any {
  const attrs: any = {};
  for (let i = 0; i < element.attributes.length; i++) {
    const attr = element.attributes[i];
    attrs[attr.name] = attr.value;
  }
  return attrs;
}

// Helper method to find elements by tag name
private findElementsByTagName(xmlDoc: Document, tagName: string): void {
  const elements = xmlDoc.getElementsByTagName(tagName);
  console.log(`Elements with tag '${tagName}':`, elements.length);
  
  for (let i = 0; i < elements.length; i++) {
    const element = elements[i] as Element;
    console.log(`${tagName} ${i + 1}:`, {
      attributes: this.getAttributes(element),
      textContent: element.textContent?.trim()
    });
  }
}

// Helper method to search for specific content
private searchXmlContent(element: Element, searchText: string): void {
  const matches: Element[] = [];
  
  const search = (el: Element) => {
    if (el.textContent && el.textContent.includes(searchText)) {
      matches.push(el);
    }
    for (let i = 0; i < el.children.length; i++) {
      search(el.children[i] as Element);
    }
  };
  
  search(element);
  
  console.log(`Elements containing "${searchText}":`, matches.length);
  matches.forEach((match, index) => {
    console.log(`Match ${index + 1}:`, {
      tag: match.tagName,
      content: match.textContent?.trim()
    });
  });
}


  
  clearFile(): void {
    this.selectedFileName = '';
    const fileInput = document.querySelector('.file-input-hidden') as HTMLInputElement;
    if (fileInput) {
      fileInput.value = '';
    }
  }

  

}


