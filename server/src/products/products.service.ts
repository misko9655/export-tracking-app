import { Injectable } from "@nestjs/common";
import { InjectModel } from "@nestjs/mongoose";
import { Product, ProductDocument } from "./product.schema";
import { Model } from "mongoose";
import { Norm, NormDocument } from "src/norms/norm.schema";
import { ProductAndNorms, ProductAndNormsDocument } from "./productWithNorms.schema";
import { data } from "./excel-array (1)"


@Injectable()
export class ProductsService {

    constructor(
        @InjectModel(Product.name) private productModel: Model<ProductDocument>,
        @InjectModel(ProductAndNorms.name) private productAndNormsModel: Model<ProductAndNormsDocument>,
        @InjectModel(Norm.name) private normModel: Model<NormDocument>
    ) { }


    async returnAllNorms() {
        try {
            // return (await this.productAndNormsModel.find().lean().exec()).flatMap(product => product.norms);
            const products = data;
            for (const product of products) {
                const tmpProduct = {
                    normCode: String(product.Normativ_Sifra),
                    productCode: String(product.Element_Artikal_Sifra),
                    productName: String(product.Element_Artikal_Naziv),
                    unitOfMeasure: String(product.Element_Artikal_JM),
                    unitsInTransportBox: Number(product.Element_Artikal_Kolicina),
                    onPallets: Number(product.onPallets),
                    norms: []
                }

                const newProduct = new this.productAndNormsModel(tmpProduct);
                await newProduct.save();
            }
            return (await this.productAndNormsModel.find().lean().exec())
        } catch (error: any) {
            throw new Error(`Failed to fetch products: ${error.message}`);
        }
    }

    async count202Norms() {
        try {
            const products = await this.productAndNormsModel.find().lean().exec();
            for (const product of products) {


                const updatedNorms: any[] = [];
                for (const norm of product.norms) {
                    let factor = norm.elementItemQuantity;
                    if (norm.elementWarehouseID === '202') {
                        const normFor202 = await this.normModel.findOne({ elementItemCode: norm.elementItemCode, elementType: 'Gotov proizvod' }).lean().exec();
                        if (!normFor202) continue;
                        factor = factor / normFor202!.elementItemQuantity;
                        const normsFor202 = await this.normModel.find({ normCode: normFor202.normCode }).lean().exec();
                        for (const tmpNorm of normsFor202) {
                            if (tmpNorm.elementType === 'Gotov proizvod') {
                                continue;
                            }
                            updatedNorms.push({ ...tmpNorm, elementItemQuantity: tmpNorm.elementItemQuantity * factor });
                        }
                    } else {
                        updatedNorms.push({ ...norm });
                    }
                }
                const updatedProduct = await this.productAndNormsModel.findOneAndUpdate({ productCode: product.productCode }, { norms: [...updatedNorms] }).lean().exec();
            }
            return await this.productAndNormsModel.find().lean().exec();

        } catch (error: any) {
            throw new Error(`Failed to fetch products: ${error.message}`);
        }
    }

    async count903Norms() {
        try {
            const products = await this.productAndNormsModel.find().lean().exec();
            for (const product of products) {


                const updatedNorms: any[] = [];
                for (const norm of product.norms) {
                    let factor = norm.elementItemQuantity;
                    if (norm.elementWarehouseID === '903' && norm.elementType === 'Repromaterijal') {
                        const normFor903 = await this.normModel.findOne({ elementItemCode: norm.elementItemCode, elementType: 'Gotov proizvod' }).lean().exec();
                        if (!normFor903) continue;
                        factor = factor / normFor903!.elementItemQuantity;
                        const normsFor903 = await this.normModel.find({ normCode: normFor903.normCode }).lean().exec();
                        for (const tmpNorm of normsFor903) {
                            if (tmpNorm.elementType === 'Gotov proizvod') {
                                continue;
                            }
                            updatedNorms.push({ ...tmpNorm, elementItemQuantity: tmpNorm.elementItemQuantity * factor });
                        }
                    } else {
                        updatedNorms.push({ ...norm });
                    }
                    await this.productAndNormsModel.findOneAndUpdate({ productCode: product.productCode }, { norms: [...updatedNorms] }).lean().exec();
                }

            }
            return await this.productAndNormsModel.find().lean().exec();
        } catch (error: any) {
            throw new Error(`Failed to fetch products: ${error.message}`);
        }
    }


    async createAllNorms() {
        try {
            const products = await this.productAndNormsModel.find().lean().exec();
            for (const product of products) {
                const normsArr: any[] = [];
                let factor = product.unitsInTransportBox;
                if (!product.normCode) continue;
                const norms = await this.normModel.find({ normCode: product.normCode }).lean().exec();
                const unitsForNorm = norms.find(norm => norm.elementWarehouseID === '903' && norm.elementType === 'Gotov proizvod')?.elementItemQuantity;
                if (unitsForNorm) {
                    factor = factor / unitsForNorm;
                }
                for (const norm of norms) {
                    if (norm.elementWarehouseID === '903' && norm.elementType === 'Gotov proizvod') {
                        continue;
                    } else if (norm.elementWarehouseID === '202') {
                        const normFor202 = await this.normModel.findOne({ elementItemCode: norm.elementItemCode, elementType: 'Gotov proizvod' }).lean().exec();
                        let factor202 = norm.elementItemQuantity * factor / normFor202!.elementItemQuantity;
                        if (!normFor202) continue;
                        const normsFor202 = await this.normModel.find({ normCode: normFor202.normCode }).lean().exec();
                        for (const tmpNorm of normsFor202) {
                            if (tmpNorm.elementType === 'Gotov proizvod') {
                                continue;
                            }
                            normsArr.push({ ...tmpNorm, elementItemQuantity: tmpNorm.elementItemQuantity * factor202 });
                        }
                    } else {
                        normsArr.push({ ...norm, elementItemQuantity: norm.elementItemQuantity * factor });
                    }
                }
                await this.productAndNormsModel.findOneAndUpdate({ productCode: product.productCode }, { norms: [...normsArr] }).exec();
                // const newProductForDb = new this.productAndNormsModel(newProduct);
                // await newProductForDb.save();
            }
            return await this.productAndNormsModel.find().lean().exec();

        } catch (error: any) {
            throw new Error(`Failed to fetch products: ${error.message}`);
        }
    }

    async deleteAllNorms() {
        try {
            await this.productAndNormsModel.updateMany({}, { norms: [] }).exec();
            return await this.productAndNormsModel.find().lean().exec();
        } catch (error: any) {
            throw new Error(`Failed to delete all norms: ${error.message}`);
        }
    }

}