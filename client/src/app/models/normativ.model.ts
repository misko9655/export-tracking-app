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

const RAW_LEAF_SKLADISTA = ['002', '004'];

function buildArtikalLookup(nodes: NormativNode[], map: Map<string, NormativNode>): void {
    for (const node of nodes) {
        const existing = map.get(node.artikalId);
        if (!existing || (node.nodes?.length ?? 0) > (existing.nodes?.length ?? 0)) {
            map.set(node.artikalId, node);
        }
        if (node.nodes?.length) buildArtikalLookup(node.nodes, map);
    }
}

function scaleNodes(nodes: NormativNode[], ratio: number): NormativNode[] {
    return nodes.map(n => ({
        ...n,
        kolicinaZaParentGP: n.kolicinaZaParentGP * ratio,
        nodes: n.nodes?.length ? scaleNodes(n.nodes, ratio) : n.nodes,
    }));
}

// The ERP's GetNormativTree only fully expands a given semi-finished product (poluproizvod)
// the first time it appears in a tree; later references to the same artikalId come back
// collapsed (no children) even though they still carry vrsta=1. skladisteId is the reliable
// signal for a true raw-material/packaging leaf (002/004); anything else must be exploded,
// substituting a proportionally-scaled copy of an exploded occurrence found elsewhere in the tree.
export function flattenMaterials(nodes: NormativNode[], lookup?: Map<string, NormativNode>): NormativNode[] {
    if (!lookup) {
        lookup = new Map();
        buildArtikalLookup(nodes, lookup);
    }

    const result: NormativNode[] = [];
    for (const node of nodes) {
        if (node.nodes?.length) {
            result.push(...flattenMaterials(node.nodes, lookup));
        } else if (RAW_LEAF_SKLADISTA.includes(node.skladisteId)) {
            result.push(node);
        } else {
            const exploded = lookup.get(node.artikalId);
            if (exploded && exploded !== node && exploded.nodes?.length && exploded.kolicinaZaParentGP > 0) {
                const ratio = node.kolicinaZaParentGP / exploded.kolicinaZaParentGP;
                result.push(...flattenMaterials(scaleNodes(exploded.nodes, ratio), lookup));
            } else {
                result.push(node);
            }
        }
    }
    return result;
}
