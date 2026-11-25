/**
 * Ne Pişir? – iPhone yerel market bağlantısı denemesi (Expo Go / React Native).
 * Yalnızca dört, sabit ve resmî HTTPS ürün URL'sini test eder.
 * Tam Ne Pişir? uygulamasının kurulumu veya işlevsel testi DEĞİLDİR.
 */
import React, { useState } from 'react';
import {
  Alert, Linking, Platform, ScrollView, Share, StyleSheet,
  Text, TouchableOpacity, View,
} from 'react-native';

const URUNLER = [
  { market: 'Migros', ad: 'Migros Süt 1 L', url: 'https://www.migros.com.tr/migros-sut-1-l-p-a805ac' },
  { market: 'CarrefourSA', ad: 'İçim Sade Süt 1 L', url: 'https://www.carrefoursa.com/icim-sade-sut-1-l-p-30096708' },
  { market: 'A101', ad: 'İçim Yağlı Süt 1 L', url: 'https://www.a101.com.tr/kapida/sut-urunleri-kahvaltilik/icim-yagli-sut-1-l_p-12000233' },
  { market: 'ŞOK', ad: 'Mis Pastörize Doğal İçme Sütü 1 L', url: 'https://www.sokmarket.com.tr/mis-pastorize-dogal-icme-sutu-1-l-p-6044' },
];

const ALANLAR = {
  Migros: 'migros.com.tr',
  CarrefourSA: 'carrefoursa.com',
  A101: 'a101.com.tr',
  'ŞOK': 'sokmarket.com.tr',
};

// Bu test yalnızca açıkça belirtilen güvenilir ürün adreslerini kullanır.
function adresGuvenli(urun) {
  try {
    const adres = new URL(urun.url);
    const alan = ALANLAR[urun.market];
    return Boolean(
      alan &&
      adres.protocol === 'https:' &&
      (adres.hostname === alan || adres.hostname.endsWith('.' + alan)) &&
      adres.pathname.length > 1 &&
      !adres.username &&
      !adres.password
    );
  } catch (_) { return false; }
}

export default function App() {
  const [sonuclar, setSonuclar] = useState({});
  const [notlar, setNotlar] = useState({});
  const yaz = (market, alan, deger) => setSonuclar(old => ({
    ...old,
    [market]: {...old[market], [alan]: deger},
  }));

  const ac = async (urun) => {
    if (!adresGuvenli(urun)) {
      Alert.alert('Güvenli bağlantı bulunamadı', 'Bu ürün için bağlantı açılamıyor.');
      return;
    }
    yaz(urun.market, 'ac', 'Bağlantı açma isteği gönderiliyor');
    try {
      await Linking.openURL(urun.url);
      // Linking.openURL resolve olması ürünün gerçekten yüklenmesini garanti etmez.
      yaz(urun.market, 'ac', 'Açma isteği işletim sistemine gönderildi');
    } catch (e) {
      yaz(urun.market, 'ac', 'Hata: ' + String(e?.message || 'Bağlantı açılamadı'));
      Alert.alert('Bağlantı açılamadı', 'İnternet bağlantını ve ürün URL’sini kontrol et.');
    }
  };

  const paylas = async (urun) => {
    if (!adresGuvenli(urun)) {
      Alert.alert('Güvenli bağlantı bulunamadı', 'Bu ürün için bağlantı paylaşılamıyor.');
      return;
    }
    yaz(urun.market, 'paylas', 'Paylaş menüsü çağrıldı');
    try {
      // Ne Pişir? gerçek arayüzündeki Share.share çağrısıyla aynı içerik.
      const sonuc = await Share.share({
        title: urun.market + ' – ' + urun.ad,
        message: urun.url,
      });
      yaz(
        urun.market,
        'paylas',
        sonuc?.action === Share.dismissedAction
          ? 'Paylaş menüsü kapatıldı'
          : 'Paylaş menüsünden işlem tamamlandı'
      );
    } catch (e) {
      yaz(urun.market, 'paylas', 'Hata: ' + String(e?.message || 'Paylaşım açılamadı'));
      Alert.alert('Paylaşım açılamadı', 'Tekrar deneyebilirsin.');
    }
  };

  const ozetiPaylas = async () => {
    const satirlar = ['Ne Pişir? – Expo Go iPhone yerel bağlantı testi',
      'Bu test tam uygulama kurulumu değildir.',
      ...URUNLER.map(urun => {
        const sonuc = sonuclar[urun.market] || {};
        const not = notlar[urun.market] || 'Belirtilmedi';
        return urun.market + ': Aç=' + (sonuc.ac || 'Denenmedi') +
          '; Paylaş=' + (sonuc.paylas || 'Denenmedi') + '; Gözlem=' + not;
      }),
    ];
    try { await Share.share({message:satirlar.join('\n'),title:'Ne Pişir? iPhone test sonucu'}); }
    catch (_) { Alert.alert('Sonuç paylaşılamadı', 'Ekran görüntüsünü de gönderebilirsin.'); }
  };

  const sec = (market, sonuc) => setNotlar(old => ({...old, [market]:sonuc}));

  return (
    <ScrollView
      style={styles.ekran}
      contentContainerStyle={styles.govde}
      testID="iphone-market-test-screen">
      <Text style={styles.baslik}>🛒 Ne Pişir? iPhone Testi</Text>
      <Text style={styles.aciklama}>
        Bu, <Text style={styles.vurgu}>Expo Go içinde çalışan küçük bir React Native testidir.</Text>
        {' '}Ne Pişir? uygulamasının tamamı değildir. 'Aç' ile iPhone'un Safari yönlendirmesini,
        'Paylaş' ile yerel iOS paylaşım menüsünü kontrol eder.
      </Text>
      <Text style={styles.uyari}>
        Telefonunda market uygulaması yüklü olmadığı için ürünlerin Safari'de açılması normaldir.
        Sepete ekleme veya ödeme yapmana gerek yok.
      </Text>
      {URUNLER.map((urun) => {
        const sonuc = sonuclar[urun.market] || {};
        return (
          <View key={urun.market} style={styles.kart}>
            <Text style={styles.market}>{urun.market}</Text>
            <Text style={styles.urun}>{urun.ad}</Text>
            <View style={styles.butonSatir}>
              <TouchableOpacity
                testID={'market-open-' + urun.market}
                accessibilityRole="button"
                style={[styles.buton, styles.acButon]}
                onPress={() => ac(urun)}>
                <Text style={styles.butonYazi}>Aç ↗</Text>
              </TouchableOpacity>
              <TouchableOpacity
                testID={'market-share-' + urun.market}
                accessibilityRole="button"
                style={[styles.buton, styles.paylasButon]}
                onPress={() => paylas(urun)}>
                <Text style={styles.butonYazi}>Paylaş</Text>
              </TouchableOpacity>
            </View>
            <Text style={styles.durum}>Aç: {sonuc.ac || 'Denenmedi'}</Text>
            <Text style={styles.durum}>Paylaş: {sonuc.paylas || 'Denenmedi'}</Text>
            <Text style={styles.soru}>Aç düğmesine basınca ne gördün?</Text>
            <View style={styles.secenekSatir}>
              {['Safari açıldı', 'Başka bir ekran', 'Açılmadı'].map(s => (
                <TouchableOpacity
                  accessibilityRole="button"
                  key={s}
                  onPress={() => sec(urun.market,s)}
                  style={[styles.secenek, notlar[urun.market]===s && styles.secilen]}>
                  <Text style={styles.secenekYazi}>{s}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        );
      })}
      <TouchableOpacity
        accessibilityRole="button"
        testID="market-share-results"
        style={styles.ozetButon}
        onPress={ozetiPaylas}>
        <Text style={styles.ozetYazi}>Test sonuçlarını paylaş</Text>
      </TouchableOpacity>
      <Text style={styles.dipnot}>
        {Platform.OS === 'ios' ? 'Gerçek iPhone / iOS' : 'Test platformu: ' + Platform.OS}
        {' '}· Yalnızca doğrulanmış HTTPS ürün adresleri
      </Text>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  ekran:{backgroundColor:'#FFF5EA'},
  govde:{padding:18,paddingTop:55,paddingBottom:55,gap:12},
  baslik:{color:'#402718',fontSize:24,fontWeight:'800'},
  aciklama:{color:'#402718',fontSize:14,lineHeight:21},
  vurgu:{fontWeight:'800'},
  uyari:{color:'#754920',backgroundColor:'#FFE0BD',borderRadius:10,padding:12,fontSize:13,lineHeight:20},
  kart:{backgroundColor:'#fff',borderRadius:14,padding:14,gap:7,borderWidth:1,borderColor:'#EBCBAB'},
  market:{color:'#BA5612',fontSize:16,fontWeight:'800'},
  urun:{color:'#402718',fontSize:15,fontWeight:'700'},
  butonSatir:{flexDirection:'row',gap:9,marginTop:5},
  buton:{flex:1,alignItems:'center',justifyContent:'center',borderRadius:9,minHeight:45,padding:10},
  acButon:{backgroundColor:'#B95B18'},
  paylasButon:{backgroundColor:'#402718'},
  butonYazi:{color:'white',fontSize:14,fontWeight:'700'},
  durum:{color:'#68513e',fontSize:12},
  soru:{color:'#402718',fontSize:12,fontWeight:'700',marginTop:7},
  secenekSatir:{flexDirection:'row',flexWrap:'wrap',gap:6},
  secenek:{borderRadius:8,backgroundColor:'#F4E5D6',paddingHorizontal:10,paddingVertical:9,minHeight:38,justifyContent:'center'},
  secilen:{backgroundColor:'#F2B878',borderWidth:1,borderColor:'#B95B18'},
  secenekYazi:{fontSize:12,color:'#402718',fontWeight:'600'},
  ozetButon:{backgroundColor:'#402718',padding:15,borderRadius:12,alignItems:'center',minHeight:50},
  ozetYazi:{color:'white',fontSize:16,fontWeight:'800'},
  dipnot:{fontSize:12,color:'#7A614E',textAlign:'center',marginTop:8},
});
