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
