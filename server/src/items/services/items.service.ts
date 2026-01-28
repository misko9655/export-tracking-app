import { Injectable } from "@nestjs/common";
import { ITEMS } from "src/model/db-data";
import { Item } from "src/model/item";


@Injectable()
export class ItemsService {
    getAllItems(): Item[] {
        return [...ITEMS];
    }
}