import { useState, useEffect } from 'react';
import { View, Text, Button, ScrollView, StyleSheet } from 'react-native';

const SERVER_URL = 'http://localhost:3001/rpc';

type BlockchainInfo = {
  chain: string;
  blocks: number;
  bestblockhash: string;
};

export default function BlockchainInfoScreen() {
  const [data, setData] = useState<BlockchainInfo | null>(null);
  const [error] = useState<string | null>(null);
  const [isServerAvailable, setIsServerAvailable] = useState<boolean | null>(null);

  const checkServerCon = async () => {
    try {
      const res = await fetch(SERVER_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ method: 'getblockchaininfo' })
      });
      const json = await res.json();
      setIsServerAvailable(!!json.result);
      if (json.result) setData(json.result);
    } catch {
      setIsServerAvailable(false);
    }
  };

  useEffect(() => {
    checkServerCon();
  }, []);

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
      <Text style={styles.title}>Informacje o sieci</Text>
      <Button title="Odśwież dane" onPress={checkServerCon} />
      {error && <Text style={styles.error}>{error}</Text>}

      {data && (
        <View style={styles.result}>
          <Text style={styles.resultText}>Sieć: {data.chain}</Text>
          <Text style={styles.resultText}>Liczba bloków: {data.blocks}</Text>
          <Text style={styles.resultText}>Hash ostatniego bloku: {data.bestblockhash}</Text>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flexGrow: 1, padding: 20, alignItems: 'center', gap: 16 },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: 20 },
  title: { fontSize: 20, fontWeight: 'bold' },
  error: { color: 'red', fontSize: 16, marginBottom: 10 },
  result: { marginTop: 20, backgroundColor: '#eee', padding: 15, borderRadius: 8, width: '100%' },
  resultText: { marginBottom: 5 },
});
