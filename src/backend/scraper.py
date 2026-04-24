import requests
from bs4 import BeautifulSoup

def recuperer_points_pongiste():
    # 1. Remplace cette URL par celle de ta page de profil
    # Exemple : "https://www.pongiste.fr/joueur/..."
    url_profil = "https://www.pongiste.fr/" 
    
    print(f"🌍 Connexion à {url_profil}...")
    
    # On imite un navigateur (User-Agent) pour ne pas être rejeté
    headers = {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
    }
    
    try:
        reponse = requests.get(url_profil, headers=headers)
        
        if reponse.status_code == 200:
            soup = BeautifulSoup(reponse.text, 'html.parser')
            
            # 2. C'est ici qu'on utilise ta découverte !
            # On cherche la DIV qui a la classe "cercle2"
            # Note : en Python, "class" est un mot réservé, donc BeautifulSoup utilise "class_"
            zone_points = soup.find('div', class_='cercle2')
            
            if zone_points:
                # .strip() sert à nettoyer les espaces vides autour du texte
                points_texte = zone_points.text.strip()
                print(f"✅ Trouvé ! Points actuels : {points_texte}")
                
                # Conversion en nombre (float pour gérer le .5)
                points_nombre = float(points_texte)
                return points_nombre
            else:
                print("❌ Impossible de trouver la balise <div class='cercle2'>. La structure a peut-être changé ?")
        else:
            print(f"❌ Erreur connexion (Code {reponse.status_code}). La page est peut-être privée ?")
            
    except Exception as e:
        print(f"❌ Erreur technique : {e}")

if __name__ == "__main__":
    recuperer_points_pongiste()