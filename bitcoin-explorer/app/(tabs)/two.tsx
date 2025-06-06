import React from 'react';
import { useState, useEffect } from 'react';
import { StyleSheet, Text, TextInput, Button, View, ScrollView, Pressable } from 'react-native';

const SERVER_URL = 'http://localhost:3001/rpc';

export default function TransactionsScreen() {
  const [query, setQuery] = useState('');
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'transaction' | 'block'>('transaction');
  const [isServerAvailable, setIsServerAvailable] = useState<boolean | null>(null);

  const checkServerCon = async () => {
    try {
      const res = await fetch(SERVER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method: 'getblockchaininfo' }),
      });
      const json = await res.json();
      setIsServerAvailable(!!json.result);
    } catch {
      setIsServerAvailable(false);
    }
  };

  useEffect(() => {
    checkServerCon();
  }, []);

  const handleSearch = async () => {
    setError(null);
    setResult(null);

    try {
      let payload;
      if (mode === 'transaction') {
        payload = { method: 'getrawtransaction', params: [query,true] };
      } else {
        let hash = query;

        if (/^\d+$/.test(query)) {
          const hashRes = await fetch(SERVER_URL, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ method: 'getblockhash', params: [parseInt(query)] }),
          });
          const hashJson = await hashRes.json();
          if (!hashJson.result) return setError('Nie znaleziono bloku');
          hash = hashJson.result;
        }

        payload = { method: 'getblock', params: [hash] };
      }

      const res = await fetch(SERVER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const json = await res.json();
      console.log(json.result);
      if (!json.result) {
        setError(mode == 'transaction' ? 'Nie znaleziono transakcji' : 'Nie znaleziono bloku');
      } else {
        setResult(json.result);
      }
    } catch {
      setError('Błąd połączenia z backendem');
    }
  };

  if (isServerAvailable == false) {
    return (
      <View style={styles.centered}>
        <Text style={styles.error}>Brak połączenia z serwerem</Text>
        <Button title="Spróbuj ponownie" onPress={checkServerCon} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Wyszukaj {mode == 'transaction' ? 'transakcję' : 'blok'}</Text>

      <View style={styles.switchContainer}>
        {['transaction', 'block'].map((button) => (
          <Pressable
            key={button}
            onPress={() => {
              setMode(button as 'transaction' | 'block');
              setQuery('');
              setResult(null);
              setError(null);
            }}
            style={[styles.switchButton, mode === button && styles.switchActive]}
          >
            <Text>{button == 'transaction' ? 'Transakcja' : 'Blok'}</Text>
          </Pressable>
        ))}
      </View>

      <TextInput
        placeholder={mode == 'transaction' ? 'Hash transakcji' : 'Hash lub numer bloku'}
        value={query}
        onChangeText={setQuery}
        style={styles.input}
        autoCapitalize="none"
      />

      <Button title="Szukaj" onPress={handleSearch} />

      {error && <Text style={styles.error}>{error}</Text>}

      {result && (
        <View style={styles.result}>
          {mode == 'transaction' ? (
            <>
              <Text style={styles.resultText}>TransactionID: {result.txid}</Text>
              <Text style={[styles.resultText, { color: result.confirmations > 0 ? 'green' : 'red' }]}>
                Potwierdzona: {result.confirmations > 0 ? 'Tak' : 'Nie'}
              </Text>
              
              <Text style={styles.resultText}>Wejścia: {result.vin.length}</Text>
              <Text style={styles.resultText}>Adresy wejś:</Text>
              <Text style={styles.resultText}>Wyjścia: {result.vout.length}</Text>
              <Text style={styles.resultText}>Adresy wyjść:</Text>
                {result.vout.map((vout, i) => (
              <Text key={i} style={styles.resultText}>
                {`${i + 1} ${vout.scriptPubKey.address}`}
              </Text>))}
            </>
          ) : (
            <>
              <Text style={styles.resultText}>Wysokość: {result.height}</Text>
              <Text style={styles.resultText}>Hash: {result.hash}</Text>
              <Text style={styles.resultText}>Rozmiar: {result.size} B</Text>
              <Text style={styles.resultText}>Czas: {new Date(result.time * 1000).toLocaleString('pl-PL')}</Text>
              <Text style={styles.resultText}>Transakcje: {result.tx.length}</Text>
            </>
          )}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, gap: 16, alignItems: 'center' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold' },
  switchContainer: { flexDirection: 'row', gap: 10 },
  switchButton: { padding: 10, backgroundColor: '#ddd', borderRadius: 5 },
  switchActive: { backgroundColor: '#aee' },
  input: { borderWidth: 1, borderColor: '#aaa', padding: 10, width: '100%', borderRadius: 5 },
  error: { color: 'red', fontSize: 16, marginVertical: 10 },
  result: { marginTop: 20, backgroundColor: '#eee', padding: 15, borderRadius: 8, width: '100%' },
  resultText: { marginBottom: 5 },
});
