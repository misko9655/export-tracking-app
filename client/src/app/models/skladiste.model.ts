export type Skladiste = { id: string; name: string };

export const SKLADISTA: Skladiste[] = [
    { id: '002', name: 'Magacin sirovina' },
    { id: '003', name: 'Magacin gotovog proizvoda' },
    { id: '004', name: 'Magacin ambalaže' },
    { id: '101', name: 'Trgovačka roba' },
    { id: '202', name: 'Prerada i poluproizvodi' },
    { id: '802', name: 'Carinski magacin sirovina' },
    { id: '804', name: 'Carinski magacin ambalaže' },
    { id: '903', name: 'Magacin GP proizvodnje' },
    { id: '904', name: 'Magacin GP izvoz' },
];

export function skladisteName(id: string): string {
    return SKLADISTA.find(s => s.id === id)?.name ?? '';
}
