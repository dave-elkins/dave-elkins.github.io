export interface SeriesInfo {
    key: string;
    title: string;
    shortTitle: string;
    description: string;
}

export const series: SeriesInfo[] = [
    {
        key: 'legible-by-design-the-long-search',
        title: 'Legible by Design: The Long Search',
        shortTitle: 'The Long Search',
        description:
            'A historical investigation into why codebases resist change, and the decades of ideas that point toward a better answer.',
    },
    {
        key: 'wysiwid-petstore',
        title: 'Building Legible Software',
        shortTitle: 'Building Legible Software',
        description:
            'A practical Python series that builds a small pet store application using Concept Design and the WYSIWID pattern.',
    },
];

export const seriesByKey = new Map(series.map((item) => [item.key, item]));

export function getSeries(key: string | undefined): SeriesInfo | undefined {
    return key ? seriesByKey.get(key) : undefined;
}
