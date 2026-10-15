# The Explore page: a masonry wall of designs, inspirations and assets.

BANNER = {"mediaUrl": "https://res.cloudinary.com/demo/image/upload/v1/wide.jpg", "shape": "banner",
          "width": 2400, "height": 800, "category": "design", "title": "Nomad billboard"}
POSTER = {"mediaUrl": "https://res.cloudinary.com/demo/video/upload/v1/poster.mp4", "shape": "a4",
          "title": "Animated poster", "caption": "Made in After Effects",
          "linkLabel": "See it on Behance", "linkUrl": "https://behance.net/x"}


def test_the_explore_page_starts_empty(client):
    assert client.get("/api/explore-pieces").json() == []


def test_pieces_show_in_the_order_saved(admin, client):
    saved = admin.put("/api/admin/explore-pieces", json=[POSTER, BANNER])
    assert saved.status_code == 200, saved.text

    pieces = client.get("/api/explore-pieces").json()
    assert [piece["title"] for piece in pieces] == ["Animated poster", "Nomad billboard"]
    assert pieces[1]["shape"] == "banner" and (pieces[1]["width"], pieces[1]["height"]) == (2400, 800)
    assert pieces[0]["category"] is None and pieces[0]["linkUrl"] == "https://behance.net/x"


def test_a_piece_needs_only_its_file(admin, client):
    admin.put("/api/admin/explore-pieces", json=[{"mediaUrl": "https://example.com/a.png"}])
    piece = client.get("/api/explore-pieces").json()[0]
    assert (piece["shape"], piece["title"], piece["category"]) == ("natural", "", None)


def test_saving_replaces_the_whole_page(admin, client):
    admin.put("/api/admin/explore-pieces", json=[POSTER, BANNER])
    admin.put("/api/admin/explore-pieces", json=[BANNER])
    assert len(client.get("/api/explore-pieces").json()) == 1


def test_unknown_shapes_and_types_are_refused(admin):
    for bad in ({**BANNER, "shape": "hexagon"}, {**BANNER, "category": "memes"}, {**BANNER, "width": 0},
                {**BANNER, "linkUrl": "javascript:alert(1)"}, {**BANNER, "linkUrl": "//other.com"}):
        assert admin.put("/api/admin/explore-pieces", json=[bad]).status_code == 422, bad


def test_editing_the_explore_page_needs_a_login(client):
    assert client.put("/api/admin/explore-pieces", json=[BANNER]).status_code == 401


def test_a_link_can_go_to_the_web_or_a_page_on_the_site(admin):
    for good in ("https://behance.net/x", "/project/nomad"):
        assert admin.put("/api/admin/explore-pieces", json=[{**BANNER, "linkUrl": good}]).status_code == 200, good
