export type NormativListItem = {
    id: string;
    opis: string;
    jm: string;
    isActive: boolean;
};

export type NormativNode = {
    id: number;
    artikalId: string;
    artikalNaziv: string;
    artikalJm: string;
    kolicina: number;
    kolicinaGP: number;
    kolicinaZaParentGP: number;
    skladisteId: string;
    skladisteNaziv: string;
    artikalZaliha: number;
    vrsta: number;
    normativId: string;
    basedOnNormativId: string | null;
    isRecursion: boolean;
    normativIsNotActive: boolean;
    nodes: NormativNode[];
};

export type NormativTop = NormativListItem & {
    tree: [{ nodes: NormativNode[] }];
};

export function flattenMaterials(nodes: NormativNode[]): NormativNode[] {
    const result: NormativNode[] = [];
    for (const node of nodes) {
        if (node.vrsta === 1) {
            result.push(node);
        } else if (node.nodes?.length) {
            result.push(...flattenMaterials(node.nodes));
        }
    }
    return result;
}
