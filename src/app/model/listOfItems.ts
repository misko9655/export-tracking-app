import Item from "./item";


class ListOfItems {
   
    static readFileAsync(file: File) {
        return new Promise((resolve, reject) => {
            let reader = new FileReader();
            reader.onload = () => {
                resolve(reader.result);
            };

            reader.onerror = reject;

            reader.readAsText(file);
        })
    }

    static async readDataFromXmlFile(file: File):Promise<Item[]> {
        try {
            const artikli: Item[] = [];
            let result: string = <string> await this.readFileAsync(file);
            let domParser = new DOMParser();
            let xmlDom = domParser.parseFromString(result, 'text/xml');
            // if(selektor === 'z:row') {
            //     return this.createListaArtiklaMagacin(Array.from(xmlDom.getElementsByTagName(selektor)));
            // } else if(selektor === 'Table') {
            //     return this.createListaArtiklaTrebovanje(Array.from(xmlDom.getElementsByTagName(selektor)));
            // }
            return this.createListOfItems(Array.from(xmlDom.getElementsByTagName('z:row')));
            // console.log(result)
            // if(result.length === 0) throw new Error('Doslo je do greske, nema podataka!');
            // return [];

            
        } catch(err) {
            console.log(err);
            return [];
        }
    }

    static createListOfItems(elementsFromFile: Element[]): Item[] {
        const items: Item[] = [];
        console.log(elementsFromFile);
        elementsFromFile.map(itemElement => {
            return itemElement.attributes;
        }).map(item => {
            const itemCode = <string>item.getNamedItem('SifraArtikla')?.value;
            const name = <string>item.getNamedItem('NazivArtikla')?.value;
            const barcode = <string>item.getNamedItem('BarKod')?.value;
            const unitOfMeasure = <string>item.getNamedItem('JedinicaMere')?.value;
            return new Item(itemCode, name, barcode, unitOfMeasure);
        }).forEach(item => items.push(item));
        console.log(items);
        return [...items];
        // }).map( item => {
        //     // let quantity = parseInt(<string>art[5].nodeValue);
        //     // if(isNaN(kolicina)) {
        //     //     kolicina = 0;
        //     // }
        //     // return new Item(<string>art[2].nodeValue, <string>art[3].nodeValue, kolicina);
        // }).forEach(artikal => {
        //     artikli.push(artikal);
        // });
        // return artikli;
    }
}

export default ListOfItems;