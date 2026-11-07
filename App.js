// ============================================================
// JE FALLA — « Je cherche » en camfranglais
// Marketplace hyperlocale d'urgence à Yaoundé
// Un seul fichier App.js, prêt à coller dans Expo Snack (snack.expo.dev)
// Léger : aucune image distante, aucune librairie de navigation.
// ============================================================

import React, { useState, useMemo, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  ScrollView,
  StyleSheet,
  StatusBar,
  Linking,
  Alert,
  BackHandler,
  Platform,
  SafeAreaView,
} from 'react-native';
import * as Location from 'expo-location';

// ------------------------------------------------------------
// 1. COULEURS (jaune et noir, style Glovo / Jumia Food)
// ------------------------------------------------------------
const JAUNE = '#FFC244';
const JAUNE_CLAIR = '#FFF3D6';
const NOIR = '#000000';
const GRIS = '#6B6B6B';
const GRIS_CLAIR = '#F2F2F2';
const VERT = '#1E9E4A';
const BLANC = '#FFFFFF';

// ------------------------------------------------------------
// 2. CATÉGORIES
// « mots » sert à reconnaître ce que l'utilisateur tape
// ------------------------------------------------------------
const CATEGORIES = [
  {
    id: 'restaurant',
    icone: '🍲',
    titre: 'Restaurant',
    slogan: 'Je falla où manger maintenant',
    mots: ['restaurant', 'manger', 'poulet', 'braise', 'braisé', 'poisson', 'ndole', 'ndolé', 'faim', 'resto', 'bouffe'],
  },
  {
    id: 'shopping',
    icone: '🛒',
    titre: 'Shopping',
    slogan: 'Je falla un magasin ouvert',
    mots: ['shopping', 'magasin', 'boutique', 'supermarche', 'supermarché', 'pharmacie', 'eau', 'gaz', 'night shop', 'epicerie', 'épicerie'],
  },
  {
    id: 'laverie',
    icone: '👕',
    titre: 'Laverie',
    slogan: 'Laverie / laveur à domicile',
    mots: ['laverie', 'laveur', 'laveuse', 'pressing', 'linge', 'lessive', 'repassage', 'habits'],
  },
  {
    id: 'plombier',
    icone: '🔧',
    titre: 'Plombier',
    slogan: 'Plombier / dépannage maison',
    mots: ['plombier', 'plomberie', 'fuite', 'robinet', 'wc', 'toilette', 'depannage', 'dépannage', 'electricien', 'électricien', 'courant'],
  },
];

// ------------------------------------------------------------
// 3. DONNÉES FICTIVES (Bastos, Mendong, Etoudi, Mvog-Ada...)
// ------------------------------------------------------------
const PRESTATAIRES = [
  // ---------- Restaurants ----------
  {
    id: 'r1', cat: 'restaurant', nom: 'Chez Mama Ngono', quartier: 'Mvog-Ada', emoji: '🍗',
    distance: 0.6, minutes: 8, prixTxt: 'à partir de 1 500 FCFA', prix: 1500,
    note: 4.6, nbAvis: 212, ouvert: true, statut: 'OUVERT', domicile: false,
    tel: '237670000001', desc: 'Poulet braisé, poisson braisé et miondo. Ouvert tard.',
    avis: [
      { auteur: 'Brice', note: 5, texte: 'Poulet bien braisé, piment correct. Servi en 10 minutes.' },
      { auteur: 'Estelle', note: 4, texte: 'Un peu de monde le soir mais ça vaut le coup.' },
    ],
  },
  {
    id: 'r2', cat: 'restaurant', nom: 'Le Ndolé de Bastos', quartier: 'Bastos', emoji: '🍲',
    distance: 1.4, minutes: 14, prixTxt: 'à partir de 3 000 FCFA', prix: 3000,
    note: 4.8, nbAvis: 340, ouvert: true, statut: 'OUVERT', domicile: false,
    tel: '237670000002', desc: 'Ndolé, eru, koki et plantains. Cadre calme, climatisé.',
    avis: [
      { auteur: 'Carine', note: 5, texte: 'Le meilleur ndolé du quartier, sans hésiter.' },
      { auteur: 'Patrick', note: 5, texte: 'Service rapide, propre. Un peu cher mais bon.' },
    ],
  },
  {
    id: 'r3', cat: 'restaurant', nom: 'Poisson Braisé Etoudi', quartier: 'Etoudi', emoji: '🐟',
    distance: 2.1, minutes: 19, prixTxt: 'à partir de 2 000 FCFA', prix: 2000,
    note: 4.3, nbAvis: 98, ouvert: false, statut: 'FERMÉ · ouvre à 17h', domicile: false,
    tel: '237670000003', desc: 'Bar et maquereau braisés, bâton de manioc.',
    avis: [{ auteur: 'Yannick', note: 4, texte: 'Poisson frais, ambiance bon enfant.' }],
  },

  // ---------- Shopping ----------
  {
    id: 's1', cat: 'shopping', nom: 'Night Shop Mendong', quartier: 'Mendong', emoji: '🌙',
    distance: 0.5, minutes: 6, prixTxt: 'Ouvert 24h/24', prix: 0,
    note: 4.4, nbAvis: 76, ouvert: true, statut: 'OUVERT', domicile: false,
    tel: '237670000004', desc: 'Eau, gaz, recharges, boissons, produits de base, la nuit aussi.',
    avis: [
      { auteur: 'Ruth', note: 5, texte: 'Sauvé à 2h du matin, gaz disponible.' },
      { auteur: 'Alain', note: 4, texte: 'Petit magasin mais bien fourni.' },
    ],
  },
  {
    id: 's2', cat: 'shopping', nom: 'Super Marché Bastos', quartier: 'Bastos', emoji: '🛒',
    distance: 1.1, minutes: 12, prixTxt: 'Livraison 500 FCFA', prix: 500,
    note: 4.7, nbAvis: 154, ouvert: true, statut: 'OUVERT', domicile: true,
    tel: '237670000005', desc: 'Grand choix, livraison à domicile dans le quartier.',
    avis: [{ auteur: 'Mireille', note: 5, texte: 'Livraison rapide, produits frais.' }],
  },
  {
    id: 's3', cat: 'shopping', nom: 'Pharmacie de Garde Mvog-Ada', quartier: 'Mvog-Ada', emoji: '💊',
    distance: 0.9, minutes: 10, prixTxt: 'De garde cette nuit', prix: 0,
    note: 4.5, nbAvis: 61, ouvert: true, statut: 'DE GARDE', domicile: false,
    tel: '237670000006', desc: 'Pharmacie de garde, conseils du pharmacien sur place.',
    avis: [{ auteur: 'Joël', note: 5, texte: 'Accueil rapide malgré l\'heure tardive.' }],
  },

  // ---------- Laverie ----------
  {
    id: 'l1', cat: 'laverie', nom: 'Pressing Express Bastos', quartier: 'Bastos', emoji: '🧺',
    distance: 0.8, minutes: 12, prixTxt: 'à partir de 500 FCFA', prix: 500,
    note: 4.7, nbAvis: 189, ouvert: true, statut: 'OUVERT', domicile: false,
    tel: '237670000007', desc: 'Lavage, repassage et pressing express. Retrait en 24h.',
    avis: [
      { auteur: 'Sandrine', note: 5, texte: 'Chemises impeccables, prêtes le lendemain.' },
      { auteur: 'Hervé', note: 4, texte: 'Bon travail, un peu d\'attente le samedi.' },
    ],
  },
  {
    id: 'l2', cat: 'laverie', nom: 'Mama Laveuse Mendong', quartier: 'Mendong', emoji: '👩🏾',
    distance: 1.3, minutes: 15, prixTxt: '1 000 FCFA/kg', prix: 1000,
    note: 4.9, nbAvis: 128, ouvert: true, statut: 'DISPONIBLE', domicile: true,
    tel: '237670000008', desc: 'Passe chez toi, lave et rapporte ton linge propre et plié.',
    avis: [
      { auteur: 'Nadège', note: 5, texte: 'Elle est venue en 15 minutes, linge nickel.' },
      { auteur: 'Fabrice', note: 5, texte: 'Sérieuse et ponctuelle. Je recommande.' },
    ],
  },
  {
    id: 'l3', cat: 'laverie', nom: 'Laverie Etoudi Clean', quartier: 'Etoudi', emoji: '🫧',
    distance: 2.4, minutes: 22, prixTxt: '700 FCFA/kg', prix: 700,
    note: 4.2, nbAvis: 54, ouvert: false, statut: 'FERMÉ · ouvre à 7h', domicile: false,
    tel: '237670000009', desc: 'Machines à jetons, séchage inclus.',
    avis: [{ auteur: 'Georges', note: 4, texte: 'Pas cher et propre.' }],
  },

  // ---------- Plombier ----------
  {
    id: 'p1', cat: 'plombier', nom: 'Dépannage Plomberie Ada', quartier: 'Mvog-Ada', emoji: '🔧',
    distance: 1.0, minutes: 15, prixTxt: 'Déplacement 2 000 FCFA', prix: 2000,
    note: 4.6, nbAvis: 87, ouvert: true, statut: 'DISPONIBLE', domicile: true,
    tel: '237670000010', desc: 'Fuites, robinets, WC bouchés. Intervention rapide.',
    avis: [
      { auteur: 'Clarisse', note: 5, texte: 'Fuite réparée en 30 minutes, prix honnête.' },
      { auteur: 'Désiré', note: 4, texte: 'Arrivé vite, il a bien expliqué le problème.' },
    ],
  },
  {
    id: 'p2', cat: 'plombier', nom: 'Plombier Pro Bastos', quartier: 'Bastos', emoji: '🚰',
    distance: 1.8, minutes: 18, prixTxt: 'Déplacement 3 000 FCFA', prix: 3000,
    note: 4.8, nbAvis: 142, ouvert: true, statut: 'DISPONIBLE', domicile: true,
    tel: '237670000011', desc: 'Installation sanitaire, chauffe-eau, urgences 24h/24.',
    avis: [{ auteur: 'Olivia', note: 5, texte: 'Très pro, matériel de qualité.' }],
  },
];

// ------------------------------------------------------------
// 4. FONCTIONS UTILES
// ------------------------------------------------------------

// Retrouve la catégorie à partir de ce que l'utilisateur a tapé
function trouverCategorie(texte) {
  const t = texte.trim().toLowerCase();
  if (!t) return null;
  const cat = CATEGORIES.find((c) => c.mots.some((m) => t.includes(m) || m.includes(t)));
  return cat ? cat.id : null;
}

// Formate un prix en FCFA avec espaces
function formaterPrix(n) {
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
}

// Étoiles texte : « 4.7★ »
function etoiles(note) {
  return `${note.toFixed(1)}★`;
}

// ------------------------------------------------------------
// 5. ÉCRAN 1 — ACCUEIL
// ------------------------------------------------------------
function EcranAccueil({ onRechercher, onChoisirCategorie }) {
  const [texte, setTexte] = useState('');
  const [position, setPosition] = useState('Yaoundé');
  const [chargementPos, setChargementPos] = useState(false);

  // Bouton géolocalisation : si refusé, on garde Yaoundé par défaut
  const localiser = async () => {
    setChargementPos(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Position refusée', 'On cherche autour de Yaoundé centre.');
        setPosition('Yaoundé centre');
      } else {
        const pos = await Location.getCurrentPositionAsync({});
        setPosition(
          `${pos.coords.latitude.toFixed(3)}, ${pos.coords.longitude.toFixed(3)}`
        );
      }
    } catch (e) {
      setPosition('Yaoundé centre');
    }
    setChargementPos(false);
  };

  return (
    <ScrollView style={s.ecran} contentContainerStyle={{ paddingBottom: 32 }} keyboardShouldPersistTaps="handled">
      {/* En-tête noir avec logo */}
      <View style={s.enteteNoir}>
        <Text style={s.logo}>
          Je <Text style={{ color: JAUNE }}>Falla</Text>
        </Text>
        <TouchableOpacity style={s.boutonPosition} onPress={localiser} accessibilityLabel="Me géolocaliser">
          <Text style={s.boutonPositionTexte}>
            {chargementPos ? '⏳ ...' : `📍 ${position}`}
          </Text>
        </TouchableOpacity>
      </View>

      {/* Zone jaune : recherche */}
      <View style={s.zoneJaune}>
        <Text style={s.titreAccueil}>Ça urge ? On trouve.</Text>
        <Text style={s.sousTitreAccueil}>Solutions à moins de 15 minutes autour de toi</Text>

        <View style={s.barreRecherche}>
          <TextInput
            style={s.champ}
            value={texte}
            onChangeText={setTexte}
            placeholder="Je falla... ex: poulet braisé, pressing, plombier"
            placeholderTextColor={GRIS}
            returnKeyType="search"
            onSubmitEditing={() => onRechercher(texte)}
          />
          <TouchableOpacity style={s.boutonChercher} onPress={() => onRechercher(texte)}>
            <Text style={s.boutonChercherTexte}>🔍</Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* 4 grosses cartes */}
      <View style={s.grille}>
        {CATEGORIES.map((c) => (
          <TouchableOpacity
            key={c.id}
            style={s.carteCategorie}
            onPress={() => onChoisirCategorie(c.id)}
            activeOpacity={0.8}
          >
            <Text style={s.carteIcone}>{c.icone}</Text>
            <Text style={s.carteTitre}>{c.titre}</Text>
            <Text style={s.carteSlogan}>{c.slogan}</Text>
          </TouchableOpacity>
        ))}
      </View>

      <Text style={s.piedAccueil}>Fait à Yaoundé · marche même avec une connexion lente</Text>
    </ScrollView>
  );
}

// ------------------------------------------------------------
// 6. ÉCRAN 2 — RÉSULTATS
// ------------------------------------------------------------
function EcranResultats({ requete, categorieId, onRetour, onOuvrirFiche }) {
  // Filtres : 'ouvert', 'prix', 'proche' (un seul actif, ou aucun)
  const [filtre, setFiltre] = useState('proche');

  const categorie = CATEGORIES.find((c) => c.id === categorieId);

  const liste = useMemo(() => {
    const t = requete.trim().toLowerCase();

    // On part de la catégorie reconnue, sinon on cherche dans les noms
    let base = categorieId
      ? PRESTATAIRES.filter((p) => p.cat === categorieId)
      : PRESTATAIRES.filter(
          (p) =>
            p.nom.toLowerCase().includes(t) ||
            p.desc.toLowerCase().includes(t) ||
            p.quartier.toLowerCase().includes(t)
        );

    if (filtre === 'ouvert') base = base.filter((p) => p.ouvert);

    const copie = [...base];
    if (filtre === 'prix') copie.sort((a, b) => a.prix - b.prix);
    else copie.sort((a, b) => a.distance - b.distance);
    return copie;
  }, [requete, categorieId, filtre]);

  const FILTRES = [
    { id: 'ouvert', label: 'Ouvert maintenant' },
    { id: 'prix', label: 'Moins cher' },
    { id: 'proche', label: 'Le plus proche' },
  ];

  const rendreCarte = ({ item }) => (
    <TouchableOpacity style={s.carteResultat} onPress={() => onOuvrirFiche(item)} activeOpacity={0.85}>
      <View style={s.avatar}>
        <Text style={{ fontSize: 28 }}>{item.emoji}</Text>
      </View>
      <View style={{ flex: 1 }}>
        <Text style={s.resNom}>{item.nom}</Text>
        <Text style={s.resInfos}>
          {item.domicile ? 'à domicile' : `${item.distance} km`} · {item.minutes} min · {item.quartier}
        </Text>
        <Text style={s.resPrix}>
          {item.prixTxt} · {etoiles(item.note)}
        </Text>
        <View style={[s.badge, { backgroundColor: item.ouvert ? VERT : GRIS }]}>
          <Text style={s.badgeTexte}>{item.statut}</Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={s.ecran}>
      <View style={s.enteteResultats}>
        <TouchableOpacity onPress={onRetour} style={s.boutonRetour} accessibilityLabel="Retour">
          <Text style={s.boutonRetourTexte}>←</Text>
        </TouchableOpacity>
        <View style={{ flex: 1 }}>
          <Text style={s.resTitre}>
            {categorie ? `${categorie.icone} ${categorie.titre}` : `« ${requete} »`}
          </Text>
          <Text style={s.resSousTitre}>{liste.length} solution(s) près de toi</Text>
        </View>
      </View>

      {/* Filtres */}
      <View style={s.ligneFiltres}>
        {FILTRES.map((f) => {
          const actif = filtre === f.id;
          return (
            <TouchableOpacity
              key={f.id}
              onPress={() => setFiltre(f.id)}
              style={[s.pastille, actif && s.pastilleActive]}
            >
              <Text style={[s.pastilleTexte, actif && { color: JAUNE }]}>{f.label}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      <FlatList
        data={liste}
        keyExtractor={(p) => p.id}
        renderItem={rendreCarte}
        contentContainerStyle={{ padding: 16, paddingBottom: 40 }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', marginTop: 48 }}>
            <Text style={{ fontSize: 40 }}>🤷🏾</Text>
            <Text style={s.vide}>Rien trouvé pour « {requete} ». Essaie « pressing », « plombier » ou « poulet braisé ».</Text>
          </View>
        }
      />
    </View>
  );
}

// ------------------------------------------------------------
// 7. ÉCRAN 3 — FICHE PRESTATAIRE
// ------------------------------------------------------------
function EcranFiche({ p, onRetour }) {
  // Appel téléphonique
  const appeler = () => Linking.openURL(`tel:+${p.tel}`);

  // Message WhatsApp pré-rempli
  const whatsapp = () => {
    const msg = encodeURIComponent(`Bonjour ${p.nom}, je vous trouve sur Je Falla. J'ai besoin de votre service maintenant.`);
    Linking.openURL(`https://wa.me/${p.tel}?text=${msg}`);
  };

  // Commande (simulée)
  const commander = () => {
    Alert.alert(
      'Commande envoyée ✅',
      `${p.nom} arrive dans environ ${p.minutes} minutes. Tu seras contacté par téléphone.`
    );
  };

  return (
    <View style={s.ecran}>
      <ScrollView contentContainerStyle={{ paddingBottom: 120 }}>
        {/* Bandeau photo (emoji pour rester léger) */}
        <View style={s.bandeauFiche}>
          <TouchableOpacity onPress={onRetour} style={[s.boutonRetour, { position: 'absolute', top: 16, left: 16 }]}>
            <Text style={s.boutonRetourTexte}>←</Text>
          </TouchableOpacity>
          <Text style={{ fontSize: 80 }}>{p.emoji}</Text>
        </View>

        <View style={{ padding: 20 }}>
          <Text style={s.ficheNom}>{p.nom}</Text>
          <Text style={s.ficheQuartier}>📍 {p.quartier}, Yaoundé</Text>

          <View style={[s.badge, { backgroundColor: p.ouvert ? VERT : GRIS, alignSelf: 'flex-start', marginTop: 8 }]}>
            <Text style={s.badgeTexte}>{p.statut}</Text>
          </View>

          {/* Trois chiffres clés */}
          <View style={s.ligneChiffres}>
            <View style={s.chiffre}>
              <Text style={s.chiffreValeur}>{etoiles(p.note)}</Text>
              <Text style={s.chiffreLabel}>{p.nbAvis} avis</Text>
            </View>
            <View style={s.chiffre}>
              <Text style={s.chiffreValeur}>{p.minutes} min</Text>
              <Text style={s.chiffreLabel}>arrivée</Text>
            </View>
            <View style={s.chiffre}>
              <Text style={[s.chiffreValeur, { fontSize: 13 }]}>
                {p.prix > 0 ? `${formaterPrix(p.prix)} F` : 'Sur place'}
              </Text>
              <Text style={s.chiffreLabel}>{p.prixTxt}</Text>
            </View>
          </View>

          <Text style={s.ficheDesc}>{p.desc}</Text>

          {/* Appeler / WhatsApp */}
          <View style={{ flexDirection: 'row', marginTop: 16 }}>
            <TouchableOpacity style={[s.boutonContact, { marginRight: 8 }]} onPress={appeler}>
              <Text style={s.boutonContactTexte}>📞 Appeler</Text>
            </TouchableOpacity>
            <TouchableOpacity style={s.boutonContact} onPress={whatsapp}>
              <Text style={s.boutonContactTexte}>💬 WhatsApp</Text>
            </TouchableOpacity>
          </View>

          {/* Avis clients */}
          <Text style={s.titreSection}>Avis clients</Text>
          {p.avis.map((a, i) => (
            <View key={i} style={s.avis}>
              <Text style={s.avisAuteur}>
                {a.auteur} · {'★'.repeat(a.note)}
              </Text>
              <Text style={s.avisTexte}>{a.texte}</Text>
            </View>
          ))}
        </View>
      </ScrollView>

      {/* Bouton Commander fixé en bas */}
      <View style={s.barreBas}>
        <TouchableOpacity style={s.boutonCommander} onPress={commander}>
          <Text style={s.boutonCommanderTexte}>Commander maintenant</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

// ------------------------------------------------------------
// 8. APPLICATION PRINCIPALE (navigation simple par état)
// ------------------------------------------------------------
export default function App() {
  const [ecran, setEcran] = useState('accueil'); // accueil | resultats | fiche
  const [requete, setRequete] = useState('');
  const [categorieId, setCategorieId] = useState(null);
  const [prestataire, setPrestataire] = useState(null);

  // Recherche libre : on devine la catégorie à partir du texte
  const rechercher = (texte) => {
    if (!texte.trim()) {
      Alert.alert('Tape ton besoin', 'Ex : poulet braisé, pressing, plombier');
      return;
    }
    setRequete(texte);
    setCategorieId(trouverCategorie(texte));
    setEcran('resultats');
  };

  // Clic sur une grosse carte
  const choisirCategorie = (id) => {
    setRequete(CATEGORIES.find((c) => c.id === id).titre);
    setCategorieId(id);
    setEcran('resultats');
  };

  // Bouton retour Android
  useEffect(() => {
    const sub = BackHandler.addEventListener('hardwareBackPress', () => {
      if (ecran === 'fiche') { setEcran('resultats'); return true; }
      if (ecran === 'resultats') { setEcran('accueil'); return true; }
      return false;
    });
    return () => sub.remove();
  }, [ecran]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: NOIR, paddingTop: Platform.OS === 'android' ? StatusBar.currentHeight : 0 }}>
      <StatusBar barStyle="light-content" backgroundColor={NOIR} />
      <View style={{ flex: 1, backgroundColor: BLANC }}>
        {ecran === 'accueil' && (
          <EcranAccueil onRechercher={rechercher} onChoisirCategorie={choisirCategorie} />
        )}
        {ecran === 'resultats' && (
          <EcranResultats
            requete={requete}
            categorieId={categorieId}
            onRetour={() => setEcran('accueil')}
            onOuvrirFiche={(p) => { setPrestataire(p); setEcran('fiche'); }}
          />
        )}
        {ecran === 'fiche' && prestataire && (
          <EcranFiche p={prestataire} onRetour={() => setEcran('resultats')} />
        )}
      </View>
    </SafeAreaView>
  );
}

// ------------------------------------------------------------
// 9. STYLES
// ------------------------------------------------------------
const s = StyleSheet.create({
  ecran: { flex: 1, backgroundColor: BLANC },

  // Accueil
  enteteNoir: {
    backgroundColor: NOIR, paddingHorizontal: 20, paddingVertical: 14,
    flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
  },
  logo: { color: BLANC, fontSize: 26, fontWeight: '900' },
  boutonPosition: { backgroundColor: JAUNE, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 20 },
  boutonPositionTexte: { color: NOIR, fontWeight: '700', fontSize: 12 },
  zoneJaune: { backgroundColor: JAUNE, padding: 20, paddingBottom: 28 },
  titreAccueil: { fontSize: 30, fontWeight: '900', color: NOIR },
  sousTitreAccueil: { fontSize: 15, color: NOIR, marginTop: 4, marginBottom: 16 },
  barreRecherche: {
    flexDirection: 'row', backgroundColor: BLANC, borderRadius: 14, alignItems: 'center',
    borderWidth: 2, borderColor: NOIR, overflow: 'hidden',
  },
  champ: { flex: 1, paddingHorizontal: 14, paddingVertical: 16, fontSize: 15, color: NOIR },
  boutonChercher: { backgroundColor: NOIR, paddingHorizontal: 18, paddingVertical: 16 },
  boutonChercherTexte: { fontSize: 18 },
  grille: { flexDirection: 'row', flexWrap: 'wrap', padding: 12 },
  carteCategorie: {
    width: '46%', margin: '2%', backgroundColor: JAUNE_CLAIR, borderRadius: 18,
    padding: 16, minHeight: 150, borderWidth: 2, borderColor: NOIR,
  },
  carteIcone: { fontSize: 44 },
  carteTitre: { fontSize: 19, fontWeight: '900', color: NOIR, marginTop: 8 },
  carteSlogan: { fontSize: 13, color: GRIS, marginTop: 4 },
  piedAccueil: { textAlign: 'center', color: GRIS, fontSize: 12, marginTop: 8 },

  // Résultats
  enteteResultats: {
    backgroundColor: NOIR, padding: 16, flexDirection: 'row', alignItems: 'center',
  },
  boutonRetour: {
    width: 40, height: 40, borderRadius: 20, backgroundColor: JAUNE,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  boutonRetourTexte: { fontSize: 20, fontWeight: '900', color: NOIR },
  resTitre: { color: BLANC, fontSize: 20, fontWeight: '900' },
  resSousTitre: { color: JAUNE, fontSize: 13, marginTop: 2 },
  ligneFiltres: { flexDirection: 'row', flexWrap: 'wrap', padding: 12, paddingBottom: 0 },
  pastille: {
    borderWidth: 2, borderColor: NOIR, borderRadius: 20,
    paddingHorizontal: 12, paddingVertical: 7, marginRight: 8, marginBottom: 8,
  },
  pastilleActive: { backgroundColor: NOIR },
  pastilleTexte: { fontWeight: '700', color: NOIR, fontSize: 13 },
  carteResultat: {
    flexDirection: 'row', backgroundColor: BLANC, borderRadius: 16, padding: 14,
    marginBottom: 12, borderWidth: 1.5, borderColor: '#E2E2E2',
  },
  avatar: {
    width: 60, height: 60, borderRadius: 14, backgroundColor: JAUNE_CLAIR,
    alignItems: 'center', justifyContent: 'center', marginRight: 12,
  },
  resNom: { fontSize: 16, fontWeight: '800', color: NOIR },
  resInfos: { fontSize: 13, color: GRIS, marginTop: 2 },
  resPrix: { fontSize: 13, fontWeight: '700', color: NOIR, marginTop: 4 },
  badge: { alignSelf: 'flex-start', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 3, marginTop: 6 },
  badgeTexte: { color: BLANC, fontSize: 11, fontWeight: '800' },
  vide: { textAlign: 'center', color: GRIS, marginTop: 12, paddingHorizontal: 24 },

  // Fiche prestataire
  bandeauFiche: { backgroundColor: JAUNE, height: 190, alignItems: 'center', justifyContent: 'center' },
  ficheNom: { fontSize: 24, fontWeight: '900', color: NOIR },
  ficheQuartier: { fontSize: 14, color: GRIS, marginTop: 4 },
  ligneChiffres: { flexDirection: 'row', marginTop: 16 },
  chiffre: {
    flex: 1, backgroundColor: GRIS_CLAIR, borderRadius: 12, padding: 12,
    marginHorizontal: 4, alignItems: 'center',
  },
  chiffreValeur: { fontSize: 17, fontWeight: '900', color: NOIR },
  chiffreLabel: { fontSize: 11, color: GRIS, marginTop: 2, textAlign: 'center' },
  ficheDesc: { fontSize: 15, color: NOIR, marginTop: 16, lineHeight: 22 },
  boutonContact: {
    flex: 1, borderWidth: 2, borderColor: NOIR, borderRadius: 12,
    paddingVertical: 14, alignItems: 'center',
  },
  boutonContactTexte: { fontWeight: '800', color: NOIR, fontSize: 15 },
  titreSection: { fontSize: 18, fontWeight: '900', color: NOIR, marginTop: 24, marginBottom: 8 },
  avis: { backgroundColor: GRIS_CLAIR, borderRadius: 12, padding: 12, marginBottom: 8 },
  avisAuteur: { fontWeight: '800', color: NOIR, fontSize: 13 },
  avisTexte: { color: NOIR, marginTop: 4, fontSize: 14, lineHeight: 20 },
  barreBas: {
    position: 'absolute', left: 0, right: 0, bottom: 0, backgroundColor: BLANC,
    padding: 16, borderTopWidth: 1, borderTopColor: '#E2E2E2',
  },
  boutonCommander: { backgroundColor: JAUNE, borderRadius: 14, paddingVertical: 17, alignItems: 'center', borderWidth: 2, borderColor: NOIR },
  boutonCommanderTexte: { fontSize: 17, fontWeight: '900', color: NOIR },
});
