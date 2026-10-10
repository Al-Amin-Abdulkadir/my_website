# Projects, case studies and the About page: creating, saving, publishing, deleting.


def test_editing_needs_a_login(client):
    assert client.get("/api/admin/entries?kind=project").status_code == 401


def test_a_wrong_password_is_refused_without_saying_which_part_was_wrong(client):
    response = client.post("/api/auth/login", json={"email": "admin@example.com", "password": "nope-not-it"})
    assert response.status_code == 401
    assert response.json()["detail"] == "Wrong email or password"


def test_a_new_project_is_a_hidden_draft_until_published(admin, client):
    project = admin.post("/api/admin/entries", json={"kind": "project", "title": "Nomad Shoes"}).json()
    assert project["slug"] == "nomad-shoes"
    assert project["isPublished"] is False
    assert client.get("/api/projects/nomad-shoes").status_code == 404


def test_two_projects_with_the_same_title_get_different_addresses(admin):
    first = admin.post("/api/admin/entries", json={"kind": "project", "title": "Nomad"}).json()
    second = admin.post("/api/admin/entries", json={"kind": "project", "title": "Nomad"}).json()
    assert (first["slug"], second["slug"]) == ("nomad", "nomad-2")


def test_saving_replaces_the_blocks_in_the_order_sent(admin, client):
    entry_id = admin.post("/api/admin/entries", json={"kind": "case_study", "title": "Study"}).json()["id"]
    blocks = [
        {"type": "heading", "content": {"text": "Findings", "align": "center"}},
        {"type": "text", "content": {"body": "Paragraph", "align": "right"}},
    ]
    admin.put(f"/api/admin/entries/{entry_id}", json={"slug": "study", "title": "Study", "isPublished": True, "blocks": blocks})

    # Save again with the order reversed and one block removed
    admin.put(f"/api/admin/entries/{entry_id}", json={"slug": "study", "title": "Study", "isPublished": True, "blocks": [blocks[1]]})

    page = client.get("/api/case-studies/study").json()
    assert [block["type"] for block in page["blocks"]] == ["text"]


def test_two_projects_cannot_share_an_address(admin, make_project):
    make_project("Taken")
    other_id = make_project("Other")
    response = admin.put(f"/api/admin/entries/{other_id}", json={"slug": "taken", "title": "Other", "blocks": []})
    assert response.status_code == 409


def test_a_project_and_a_case_study_may_share_an_address(admin, make_project):
    make_project("Nomad")
    case_study = admin.post("/api/admin/entries", json={"kind": "case_study", "title": "Nomad"}).json()
    assert case_study["slug"] == "nomad"


def test_the_about_page_address_cannot_change(admin):
    about = admin.get("/api/admin/pages/about").json()
    response = admin.put(f"/api/admin/entries/{about['id']}", json={"slug": "me", "title": "About", "blocks": []})
    assert response.status_code == 400


def test_the_about_page_cannot_be_deleted(admin):
    about = admin.get("/api/admin/pages/about").json()
    assert admin.delete(f"/api/admin/entries/{about['id']}").status_code == 400


def test_publishing_the_about_page_shows_it_on_the_site(admin, client):
    assert client.get("/api/pages/about").status_code == 404     # a draft at first
    about = admin.get("/api/admin/pages/about").json()
    admin.put(f"/api/admin/entries/{about['id']}", json={
        "slug": "about", "title": "About Me", "isPublished": True,
        "blocks": [{"type": "text", "content": {"body": "I study how things work."}}]})
    assert client.get("/api/pages/about").json()["blocks"][0]["content"]["body"] == "I study how things work."


def test_search_lists_published_entries_only(admin, client, make_project):
    make_project("Published one")
    make_project("Draft one", published=False)
    titles = [item["title"] for item in client.get("/api/search-index").json()]
    assert titles == ["Published one"]


def test_search_includes_each_entrys_tags(admin, client):
    entry_id = admin.post("/api/admin/entries", json={"kind": "project", "title": "Kinetic"}).json()["id"]
    admin.put(f"/api/admin/entries/{entry_id}", json={
        "slug": "kinetic", "title": "Kinetic", "tags": ["Fitness", "Branding"], "isPublished": True, "blocks": []})
    assert client.get("/api/search-index").json()[0]["tags"] == ["Fitness", "Branding"]


def test_a_cover_can_be_framed_with_a_focus_point_and_zoom(admin, client):
    project = admin.post("/api/admin/entries", json={"kind": "project", "title": "Kinetic"}).json()
    saved = admin.put(f"/api/admin/entries/{project['id']}", json={
        "slug": "kinetic", "title": "Kinetic", "isPublished": True, "blocks": [],
        "coverPosition": "40% 25.5%", "coverZoom": 1.6})
    assert saved.status_code == 200, saved.text

    listed = client.get("/api/projects").json()[0]
    assert (listed["coverPosition"], listed["coverZoom"]) == ("40% 25.5%", 1.6)
    searched = client.get("/api/search-index").json()[0]
    assert (searched["coverPosition"], searched["coverZoom"]) == ("40% 25.5%", 1.6)


def test_a_cover_keeps_the_old_words_and_starts_unzoomed(admin, make_project, client):
    make_project("Nomad")
    listed = client.get("/api/projects").json()[0]
    assert (listed["coverPosition"], listed["coverZoom"]) == ("center", 1)


def test_impossible_cover_framing_is_refused(admin):
    project = admin.post("/api/admin/entries", json={"kind": "project", "title": "Pulse"}).json()
    base = {"slug": "pulse", "title": "Pulse", "isPublished": True, "blocks": []}
    for bad in ({"coverPosition": "101% 50%"}, {"coverPosition": "100.5% 0%"}, {"coverPosition": "left"},
                {"coverZoom": 0.5}, {"coverZoom": 5}):
        response = admin.put(f"/api/admin/entries/{project['id']}", json={**base, **bad})
        assert response.status_code == 422, bad


def test_a_cover_can_show_whole_in_its_card(admin, client):
    project = admin.post("/api/admin/entries", json={"kind": "project", "title": "Steward"}).json()
    base = {"slug": "steward", "title": "Steward", "isPublished": True, "blocks": []}
    assert client.get("/api/projects").json() == []          # a draft until saved
    admin.put(f"/api/admin/entries/{project['id']}", json=base)
    assert client.get("/api/projects").json()[0]["coverFit"] == "card"   # cropped to the card, as before

    admin.put(f"/api/admin/entries/{project['id']}", json={**base, "coverFit": "whole"})
    assert client.get("/api/projects").json()[0]["coverFit"] == "whole"

    refused = admin.put(f"/api/admin/entries/{project['id']}", json={**base, "coverFit": "stretch"})
    assert refused.status_code == 422
