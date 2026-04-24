import sqlite3
from fastapi import FastAPI, HTTPException # type: ignore
from pydantic import BaseModel # type: ignore
from fastapi.middleware.cors import CORSMiddleware # type: ignore 
import itertools

# --- 0. LE CERVEAU (Barème Officiel FFTT) ---
def calculer_points_fftt(points_vainqueur, points_perdant):
    """
    Calcule les points gagnés/perdus selon la grille officielle FFTT.
    Retourne : (nouveau_pts_gagnant, nouveau_pts_perdant, echange)
    """
    ecart = abs(points_vainqueur - points_perdant)
    
    # Déterminer si c'est une victoire "Normale" ou une "Perf"
    # Si le vainqueur avait moins de points (ou autant), c'est une Perf.
    is_perf = points_vainqueur < points_perdant

    # Grille officielle (Ecart min, Ecart max, Gain si Normal, Gain si Perf)
    # Source : Règlement Fédéral
    grille = [
        (0, 24, 6.0, 6.0),      # Écart très faible
        (25, 49, 5.5, 7.0),
        (50, 99, 5.0, 8.0),
        (100, 149, 4.0, 10.0),
        (150, 199, 3.0, 13.0),
        (200, 299, 2.0, 17.0),
        (300, 399, 1.0, 22.0),
        (400, 99999, 0.5, 28.0) # Écart énorme
    ]

    points_echange = 0

    # On parcourt la grille pour trouver la bonne ligne
    for (min_e, max_e, gain_normal, gain_perf) in grille:
        if min_e <= ecart <= max_e:
            if is_perf:
                points_echange = gain_perf
            else:
                points_echange = gain_normal
            break # On a trouvé, on arrête de chercher

    # Application des points
    nouveau_pts_gagnant = points_vainqueur + points_echange
    nouveau_pts_perdant = points_perdant - points_echange

    # Petit détail pro : on arrondit pour éviter les 1200.0000001
    return round(nouveau_pts_gagnant, 2), round(nouveau_pts_perdant, 2), points_echange

app = FastAPI(title="PingMaster API - SQLite Backend")

# Cela autorise le navigateur (Web) à discuter avec le serveur
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Autorise toutes les origines (PC, Mobile, etc.)
    allow_credentials=True,
    allow_methods=["*"],  # Autorise toutes les actions (GET, POST...)
    allow_headers=["*"],
)

# --- TABLE VESTIAIRE (Posts/Publications) ---
class PostModel(BaseModel):
    auteur: str
    titre: str
    contenu: str
    type: str = "info"

@app.post("/vestiaire")
def ajouter_post(post: PostModel):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO posts (auteur, titre, contenu, type) VALUES (?, ?, ?, ?)",
        (post.auteur, post.titre, post.contenu, post.type)
    )
    conn.commit()
    conn.close()
    return {"message": "Post publié !"}

@app.get("/vestiaire")
def lire_vestiaire():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM posts ORDER BY date DESC")
    posts = cursor.fetchall()
    conn.close()
    return posts

class EventModel(BaseModel):
    titre: str
    date: str
    heure: str
    type: str = "entrainement"
    lieu: str = "Salle du Club"
    description: str = ""

@app.post("/evenements")
def ajouter_evenement(evt: EventModel):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO evenements (titre, date, heure, type, lieu, description) VALUES (?, ?, ?, ?, ?, ?)",
        (evt.titre, evt.date, evt.heure, evt.type, evt.lieu, evt.description)
    )
    conn.commit()
    conn.close()
    return {"message": "Évènement ajouté !"}

@app.get("/evenements")
def lire_evenements():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM evenements ORDER BY date ASC, heure ASC")
    events = cursor.fetchall()
    conn.close()
    return events

# --- 1. MODÈLE DE DONNÉES (Pour la validation) ---
# Pydantic permet de définir à quoi ressemble un joueur "propre"
class JoueurInput(BaseModel):
    licence: str
    nom: str
    prenom: str
    points: float
    club: str

class MatchInput(BaseModel):
    nom_gagnant: str
    prenom_gagnant: str
    nom_perdant: str
    prenom_perdant: str

# --- 2. OUTIL DE CONNEXION ---
def get_db_connection():
    conn = sqlite3.connect('pingpong.db')
    # Cette ligne est magique : elle permet d'accéder aux colonnes par leur nom
    # (ex: row['nom'] au lieu de row[1])
    conn.row_factory = sqlite3.Row 
    return conn

# --- 3. ROUTES (Les chemins de ton API) ---

@app.get("/")
def home():
    return {"status": "online", "source": "SQLite Database"}

@app.get("/joueurs")
def get_tous_les_joueurs():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # On récupère tout le monde
    cursor.execute("SELECT * FROM joueurs")
    joueurs = cursor.fetchall()
    
    conn.close()
    return joueurs

@app.get("/joueur/{nom}")
def get_joueur_par_nom(nom: str):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Recherche insensible à la casse (grâce au LIKE et aux %)
    cursor.execute("SELECT * FROM joueurs WHERE nom LIKE ?", (f"%{nom}%",))
    joueur = cursor.fetchone() # On en prend juste un
    
    conn.close()
    
    if joueur is None:
        raise HTTPException(status_code=404, detail="Joueur introuvable")
    
    return joueur

# --- NOUVEAU : AJOUTER UN JOUEUR VIA l'API (Méthode POST) ---
@app.post("/joueur/ajouter")
def ajouter_joueur(joueur: JoueurInput):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    try:
        cursor.execute("""
            INSERT INTO joueurs (licence, nom, prenom, points, club)
            VALUES (?, ?, ?, ?, ?)
        """, (joueur.licence, joueur.nom, joueur.prenom, joueur.points, joueur.club))
        conn.commit()
        nouvel_id = cursor.lastrowid # On récupère l'ID créé
        conn.close()
        return {"message": "Joueur ajouté !", "id": nouvel_id, "nom": joueur.nom}
        
    except sqlite3.IntegrityError:
        conn.close()
        raise HTTPException(status_code=400, detail="Cette licence existe déjà.")
    
class PresenceModel(BaseModel):
    joueur_id: int
    date: str
    statut: str

@app.post("/presences")
def noter_presence(data: PresenceModel):
    conn = get_db_connection()
    cursor = conn.cursor()
    # On vérifie si on a déjà noté ce joueur ce jour-là pour éviter les doublons
    cursor.execute("SELECT id FROM presences WHERE joueur_id = ? AND date = ?", (data.joueur_id, data.date))
    existe = cursor.fetchone()
    
    if existe:
        cursor.execute("UPDATE presences SET statut = ? WHERE id = ?", (data.statut, existe[0]))
    else:
        cursor.execute("INSERT INTO presences (joueur_id, date, statut) VALUES (?, ?, ?)", 
                       (data.joueur_id, data.date, data.statut))
    
    conn.commit()
    conn.close()
    return {"status": "noté"}

@app.get("/stats/assiduite")
def get_assiduite():
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # Récupère le % de présence par joueur (Top 10)
    # C'est une requête SQL un peu avancée qui compte le total et les présences
    cursor.execute("""
        SELECT j.nom, j.prenom, 
               COUNT(p.id) as total_seances,
               SUM(CASE WHEN p.statut = 'present' THEN 1 ELSE 0 END) as presences_reelles
        FROM presences p
        JOIN joueurs j ON p.joueur_id = j.id
        GROUP BY j.id
        ORDER BY presences_reelles DESC
    """)
    stats = cursor.fetchall()
    conn.close()
    
    # On formate pour le frontend
    resultat = []
    for s in stats:
        nom, prenom, total, present = s
        pourcentage = round((present / total * 100)) if total > 0 else 0
        resultat.append({
            "nom": f"{prenom} {nom}",
            "total": total,
            "present": present,
            "pourcentage": pourcentage
        })
    return resultat

@app.post("/match")
def jouer_match(match: MatchInput):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. Récupérer le GAGNANT (Nom ET Prénom)
    # On utilise "LIKE" pour ignorer les majuscules/minuscules
    cursor.execute("""
        SELECT * FROM joueurs 
        WHERE nom LIKE ? AND prenom LIKE ?
    """, (match.nom_gagnant, match.prenom_gagnant))
    gagnant = cursor.fetchone()
    
    # 2. Récupérer le PERDANT (Nom ET Prénom)
    cursor.execute("""
        SELECT * FROM joueurs 
        WHERE nom LIKE ? AND prenom LIKE ?
    """, (match.nom_perdant, match.prenom_perdant))
    perdant = cursor.fetchone()
    
    # Vérification stricte
    if not gagnant:
        conn.close()
        raise HTTPException(status_code=404, detail=f"Gagnant introuvable : {match.prenom_gagnant} {match.nom_gagnant}")
    
    if not perdant:
        conn.close()
        raise HTTPException(status_code=404, detail=f"Perdant introuvable : {match.prenom_perdant} {match.nom_perdant}")
    
    # 3. CALCULER LES POINTS (Barème FFTT)
    points_g, points_p = gagnant['points'], perdant['points']
    new_pts_g, new_pts_p, echange = calculer_points_fftt(points_g, points_p)
    
    # 4. MISE À JOUR (UPDATE)
    cursor.execute("UPDATE joueurs SET points = ? WHERE id = ?", (new_pts_g, gagnant['id']))
    cursor.execute("UPDATE joueurs SET points = ? WHERE id = ?", (new_pts_p, perdant['id']))
    
    # SAUVEGARDE DE L'HISTORIQUE DES MATCHS
    cursor.execute("""
        INSERT INTO matchs (gagnant_id, perdant_id, points_echanges)
        VALUES (?, ?, ?)
    """, (gagnant['id'], perdant['id'], echange))

    conn.commit() # On valide tout d'un coup
    conn.close()
    
    return {
        "message": "Match enregistré avec succès !",
        "details": {
            "gagnant": f"{gagnant['prenom']} {gagnant['nom']} ({points_g} -> {new_pts_g})",
            "perdant": f"{perdant['prenom']} {perdant['nom']} ({points_p} -> {new_pts_p})",
            "points_echanges": echange
        }
    }

class TournoiModel(BaseModel):
    nom: str
    nb_tables: int

class InscriptionModel(BaseModel):
    tournoi_id: int
    joueur_id: int = None
    nom_invite: str = None
    points: int = 500

@app.post("/tournois")
def creer_tournoi(t: TournoiModel):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("INSERT INTO tournois (nom, nb_tables) VALUES (?, ?)", (t.nom, t.nb_tables))
    tournoi_id = cursor.lastrowid
    conn.commit()
    conn.close()
    return {"id": tournoi_id, "message": "Tournoi créé"}

@app.get("/tournois")
def get_tournois():
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("SELECT * FROM tournois ORDER BY date DESC")
    res = cursor.fetchall()
    conn.close()
    return res

@app.post("/tournois/inscription")
def inscrire_joueur(i: InscriptionModel):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        INSERT INTO participants_tournoi (tournoi_id, joueur_id, nom_invite, points_depart)
        VALUES (?, ?, ?, ?)
    """, (i.tournoi_id, i.joueur_id, i.nom_invite, i.points))
    conn.commit()
    conn.close()
    return {"status": "Inscrit"}

@app.get("/tournois/{id}/participants")
def get_participants(id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    # On fait une jointure pour récupérer le nom du vrai joueur s'il existe
    cursor.execute("""
        SELECT pt.id, pt.nom_invite, j.nom, j.prenom, pt.points_depart
        FROM participants_tournoi pt
        LEFT JOIN joueurs j ON pt.joueur_id = j.id
        WHERE pt.tournoi_id = ?
        ORDER BY pt.points_depart DESC
    """, (id,))
    res = cursor.fetchall()
    conn.close()
    
    # Nettoyage des données pour le front
    clean_list = []
    for row in res:
        p_id, invite, nom, prenom, pts = row
        nom_final = f"{prenom} {nom}" if nom else invite
        clean_list.append({"id": p_id, "nom": nom_final, "points": pts})
        
    return clean_list

import string

@app.post("/tournois/{id}/generation")
def generer_poules(id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    cursor.execute("SELECT id FROM participants_tournoi WHERE tournoi_id = ? ORDER BY points_depart DESC", (id,))
    participants = [row[0] for row in cursor.fetchall()]
    
    cursor.execute("SELECT nb_tables FROM tournois WHERE id = ?", (id,))
    nb_poules = cursor.fetchone()[0]
    
    import string
    lettres = string.ascii_uppercase[:nb_poules]
    groupes = {l: [] for l in lettres}
    
    cursor.execute("DELETE FROM matchs_tournoi WHERE tournoi_id = ?", (id,))
    
    montee = True
    index = 0
    for p_id in participants:
        lettre = lettres[index]
        groupes[lettre].append(p_id)
        cursor.execute("UPDATE participants_tournoi SET poule = ? WHERE id = ?", (lettre, p_id))
        if montee:
            if index < nb_poules - 1: index += 1
            else: montee = False
        else:
            if index > 0: index -= 1
            else: montee = True

    # Génération Intelligente (Tours séparés pour pouvoir jouer plusieurs matchs en même temps)
    for lettre, ids in groupes.items():
        paires = []
        if len(ids) == 3:
            paires = [(0, 2), (1, 2), (0, 1)]
        elif len(ids) == 4:
            paires = [(0, 3), (1, 2), (0, 2), (1, 3), (0, 1), (2, 3)]
        else:
            import itertools
            paires = list(itertools.combinations(range(len(ids)), 2))

        for idx_match, (i1, i2) in enumerate(paires):
            # Assigne un numéro de tour logique
            tour = str((idx_match // 2) + 1) if len(ids) == 4 else str(idx_match + 1)
            cursor.execute("""
                INSERT INTO matchs_tournoi (tournoi_id, poule, joueur1_id, joueur2_id, tour)
                VALUES (?, ?, ?, ?, ?)
            """, (id, lettre, ids[i1], ids[i2], tour))

    cursor.execute("UPDATE tournois SET status = 'poules' WHERE id = ?", (id,))
    conn.commit()
    conn.close()
    return {"status": "Poules générées"}

@app.post("/tournois/{id}/cloture-poules")
def cloturer_poules(id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. CLASSEMENT
    cursor.execute("SELECT poule, joueur1_id, score1, joueur2_id, score2 FROM matchs_tournoi WHERE tournoi_id = ? AND poule != 'Tableau'", (id,))
    matchs = cursor.fetchall()
    
    points = {} 
    for m in matchs:
        poule, j1, s1, j2, s2 = m
        if j1 not in points: points[j1] = 0
        if j2 not in points: points[j2] = 0
        if s1 > s2: points[j1] += 1
        elif s2 > s1: points[j2] += 1
        
    cursor.execute("SELECT DISTINCT poule FROM participants_tournoi WHERE tournoi_id = ?", (id,))
    lettres_poules = sorted([row[0] for row in cursor.fetchall()])
    
    # 2. SELECTION DES 2 MEILLEURS DE CHAQUE POULE
    qualifies = []
    for l in lettres_poules:
        cursor.execute("SELECT id FROM participants_tournoi WHERE tournoi_id = ? AND poule = ?", (id, l))
        ids_poule = [row[0] for row in cursor.fetchall()]
        classement = sorted(ids_poule, key=lambda pid: points.get(pid, 0), reverse=True)
        
        if len(classement) >= 1: qualifies.append({"poule": l, "pos": 1, "id": classement[0]})
        if len(classement) >= 2: qualifies.append({"poule": l, "pos": 2, "id": classement[1]})

    # 3. GÉNÉRATION UNIVERSELLE DU TABLEAU (Marche avec 1, 2, 3, 4, ou N poules !)
    # On trie d'abord tous les 1ers ensemble, puis tous les 2èmes
    qualifies_tries = sorted(qualifies, key=lambda x: x['pos']) 
    matchs_tableau = []
    n = len(qualifies_tries)
    
    # Le meilleur (début de liste) affronte le moins bon (fin de liste)
    for i in range(n // 2):
        j1 = qualifies_tries[i]['id']
        j2 = qualifies_tries[n - 1 - i]['id']
        
        # Détermine le nom du tour automatiquement
        if n > 8: tour_name = "1/8"
        elif n > 4: tour_name = "1/4"
        elif n > 2: tour_name = "1/2"
        else: tour_name = "Finale"
        
        matchs_tableau.append((j1, j2, tour_name))

    cursor.execute("DELETE FROM matchs_tournoi WHERE tournoi_id = ? AND poule = 'Tableau'", (id,))
    
    for j1, j2, tour in matchs_tableau:
        cursor.execute("""
            INSERT INTO matchs_tournoi (tournoi_id, poule, joueur1_id, joueur2_id, tour)
            VALUES (?, 'Tableau', ?, ?, ?)
        """, (id, j1, j2, tour))

    cursor.execute("UPDATE tournois SET status = 'tableau' WHERE id = ?", (id,))
    conn.commit()
    conn.close()
    return {"status": "Tableau final généré !"}

@app.post("/tournois/match")
def update_match_score(data: dict):
    # data attendu : {match_id: 12, score1: 3, score2: 1}
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute("""
        UPDATE matchs_tournoi 
        SET score1 = ?, score2 = ?, termine = 1 
        WHERE id = ?
    """, (data['score1'], data['score2'], data['match_id']))
    conn.commit()
    conn.close()
    return {"status": "Score enregistré"}

# Route pour récupérer l'affichage des poules
@app.get("/tournois/{id}/poules")
def get_poules_display(id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. Les Joueurs
    cursor.execute("""
        SELECT pt.id, pt.poule, pt.nom_invite, j.nom, j.prenom, pt.points_depart
        FROM participants_tournoi pt
        LEFT JOIN joueurs j ON pt.joueur_id = j.id
        WHERE pt.tournoi_id = ?
        ORDER BY pt.poule ASC, pt.points_depart DESC
    """, (id,))
    joueurs_data = cursor.fetchall()
    
    # 2. Les Matchs
    cursor.execute("""
        SELECT m.id, m.poule, 
               p1.nom_invite, j1.nom, j1.prenom,
               p2.nom_invite, j2.nom, j2.prenom,
               m.score1, m.score2, m.termine, m.tour
        FROM matchs_tournoi m
        LEFT JOIN participants_tournoi p1 ON m.joueur1_id = p1.id
        LEFT JOIN joueurs j1 ON p1.joueur_id = j1.id
        LEFT JOIN participants_tournoi p2 ON m.joueur2_id = p2.id
        LEFT JOIN joueurs j2 ON p2.joueur_id = j2.id
        WHERE m.tournoi_id = ?
    """, (id,))
    matchs_data = cursor.fetchall()
    conn.close()
    
    # Formatage
    resultat = {}
    
    # On range les joueurs
    for row in joueurs_data:
        p_id, lettre, invite, nom, prenom, pts = row
        nom_final = f"{prenom} {nom}" if nom else invite
        if lettre not in resultat: resultat[lettre] = {"joueurs": [], "matchs": []}
        resultat[lettre]["joueurs"].append({"id": p_id, "nom": nom_final, "points": pts})
        
    # On range les matchs (C'EST ICI LA CORRECTION)
    for row in matchs_data:
        m_id, lettre, inv1, n1, p1, inv2, n2, p2, s1, s2, term, tour = row
        nom1 = f"{p1} {n1}" if n1 else inv1
        nom2 = f"{p2} {n2}" if n2 else inv2
        
        # SI LA BOÎTE (ex: "Tableau") N'EXISTE PAS ENCORE, ON LA CRÉE
        if lettre not in resultat:
             resultat[lettre] = {"joueurs": [], "matchs": []}
            
        resultat[lettre]["matchs"].append({
            "id": m_id, 
            "j1": nom1, "j2": nom2, 
            "s1": s1, "s2": s2, "termine": term,
            "tour": tour # Important pour le tri des phases finales
        })

    return resultat

# --- 4. MESSAGERIE INTERNE ---
class MessageModel(BaseModel):
    club_id: int = 1
    auteur: str
    contenu: str

@app.post("/chat")
def envoyer_message(msg: MessageModel):
    conn = get_db_connection()
    cursor = conn.cursor()
    cursor.execute(
        "INSERT INTO messages (club_id, auteur, contenu) VALUES (?, ?, ?)",
        (msg.club_id, msg.auteur, msg.contenu)
    )
    conn.commit()
    conn.close()
    return {"status": "envoyé"}

@app.get("/chat/{club_id}")
def lire_chat(club_id: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    # On récupère les 50 derniers messages
    cursor.execute("SELECT * FROM messages WHERE club_id = ? ORDER BY date ASC LIMIT 50", (club_id,))
    msgs = cursor.fetchall()
    conn.close()
    return msgs

from typing import Dict, List

# Stockage en mémoire des matchs en direct (ID -> Données)
# Pour une vraie prod, on mettrait ça en base de données, mais la RAM suffit pour du temps réel.
live_matches: Dict[str, dict] = {}

# Simulation de matchs WTT (Source externe)
wtt_matches = [
    {"id": "wtt1", "joueur1": "F. LEBRUN", "joueur2": "FAN Zhendong", "score": "2 - 1", "statut": "En cours (WTT Doha)"},
    {"id": "wtt2", "joueur1": "Wang Chuqin", "joueur2": "T. MOREGARD", "score": "0 - 0", "statut": "À venir 16h00"}
]

class LiveUpdateModel(BaseModel):
    match_id: str
    joueur1: str
    joueur2: str
    score1: int
    score2: int
    set1: int
    set2: int
    service: int

@app.get("/lives")
def get_lives():
    # On renvoie les lives du club ET les lives WTT
    return {
        "club": list(live_matches.values()),
        "wtt": wtt_matches
    }

@app.post("/lives/update")
def update_live(data: LiveUpdateModel):
    # On met à jour ou on crée le match dans la liste
    live_matches[data.match_id] = data.dict()
    return {"status": "ok"}

@app.delete("/lives/{match_id}")
def stop_live(match_id: str):
    if match_id in live_matches:
        del live_matches[match_id]
    return {"status": "stopped"}

@app.get("/joueur/{id_joueur}/historique")
def get_historique_joueur(id_joueur: int):
    conn = get_db_connection()
    cursor = conn.cursor()
    
    # 1. Récupérer le joueur actuel
    cursor.execute("SELECT * FROM joueurs WHERE id = ?", (id_joueur,))
    joueur = cursor.fetchone()
    if not joueur:
        conn.close()
        raise HTTPException(status_code=404, detail="Joueur inconnu")
        
    points_actuels = joueur['points']
    
    # 2. Récupérer TOUS les matchs (pas de limite 10 pour le calcul des stats)
    cursor.execute("""
        SELECT * FROM matchs 
        WHERE gagnant_id = ? OR perdant_id = ?
        ORDER BY date DESC
    """, (id_joueur, id_joueur))
    
    matchs = cursor.fetchall()
    conn.close()
    
    # --- CALCUL MONEYBALL ---
    total_matchs = len(matchs)
    victoires = 0
    best_perf = 0
    worst_contre = 0
    
    courbe = []
    # Point de départ (aujourd'hui)
    courbe.append({ "match": "Actuel", "points": points_actuels })
    pts_temp = points_actuels
    
    for m in matchs:
        # Analyse des victoires/défaites
        if m['gagnant_id'] == id_joueur:
            victoires += 1
            pts_gagnes = m['points_echanges']
            if pts_gagnes > best_perf: best_perf = pts_gagnes
            
            # Pour la courbe : avant j'avais MOINS
            pts_temp = pts_temp - pts_gagnes
            resultat_txt = "Victoire"
        else:
            pts_perdus = m['points_echanges']
            if pts_perdus > worst_contre: worst_contre = pts_perdus
            
            # Pour la courbe : avant j'avais PLUS
            pts_temp = pts_temp + pts_perdus
            resultat_txt = "Défaite"
            
        courbe.append({
            "match": resultat_txt,
            "points": round(pts_temp, 2)
        })
    
    # Calcul du Ratio (évite la division par zéro)
    ratio = round((victoires / total_matchs * 100)) if total_matchs > 0 else 0

    # On renvoie un objet complet
    return {
        "stats": {
            "total_matchs": total_matchs,
            "victoires": victoires,
            "defaites": total_matchs - victoires,
            "ratio": ratio,
            "best_perf": round(best_perf, 1),
            "worst_contre": round(worst_contre, 1)
        },
        "courbe": courbe[::-1] # On remet dans l'ordre chronologique
    }