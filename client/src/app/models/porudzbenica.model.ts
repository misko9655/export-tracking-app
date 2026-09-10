export type PorudzbenicaStavka = {
    _id: string;
    artikalId: string;
    artikalNaziv: string;
    artikalJm: string;
    kolicina: number;
    cenaPoJm: number;
};

export type Porudzbenica = {
    id: string;
    brojPorudzbenice: string;
    dobavljac: string;
    datum: Date;
    napomena?: string;
    status: 'kreirana' | 'poslata' | 'realizovana';
    kreiranaOd: string;
    stavke: PorudzbenicaStavka[];
};
