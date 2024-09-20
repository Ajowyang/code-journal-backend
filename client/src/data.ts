export type Entry = {
  entryId?: number;
  title: string;
  notes: string;
  photoUrl: string;
};

type Data = {
  entries: Entry[];
  nextEntryId: number;
};

const dataKey = 'code-journal-data';

function readData(): Data {
  let data: Data;
  const localData = localStorage.getItem(dataKey);
  if (localData) {
    data = JSON.parse(localData) as Data;
  } else {
    data = {
      entries: [],
      nextEntryId: 1,
    };
  }
  return data;
}

export async function readEntries(): Promise<Entry[]> {
  return readData().entries;
}

export async function readEntry(entryId: number): Promise<Entry | undefined> {
  return readData().entries.find((e) => e.entryId === entryId);
}

export async function addEntry(entry: Entry): Promise<Entry | void> {
  try {
    const req = {
      method: 'POST',
      body: JSON.stringify(entry),
    };
    const response = await fetch('/api/create', req);
    const formattedResponse = (await response.json()) as Entry;
    return formattedResponse;
  } catch (err) {
    console.error(err);
    return;
  }
}

export async function updateEntry(entry: Entry): Promise<Entry | void> {
  try {
    const req = {
      method: 'PUT',
      body: JSON.stringify(entry),
    };
    const response = await fetch(`/api/update/${entry.entryId}`, req);
    const formattedResponse = (await response.json()) as Entry;
    return formattedResponse;
  } catch (err) {
    console.error(err);
    return;
  }
}

export async function removeEntry(entryId: number): Promise<Entry | void> {
  try {
    const req = {
      method: 'DELETE',
    };
    const response = await fetch(`/api/delete/${entryId}`, req);
    const formattedResponse = (await response.json()) as Entry;
    return formattedResponse;
  } catch (err) {
    console.error(err);
    return;
  }
}
