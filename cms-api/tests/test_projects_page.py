# The Projects page grid — rows, drafts, and projects that aren't in a row yet.


def save_rows(admin, rows):
    response = admin.put("/api/admin/projects-page-rows", json=rows)
    assert response.status_code == 200, response.text


def titles_on_page(client):
    titles = []
    for row in client.get("/api/projects-page").json():
        titles.append(row["mainProject"]["title"])
        if row["secondProject"]:
            titles.append(row["secondProject"]["title"])
    return titles


def test_rows_show_in_the_order_saved(admin, client, make_project):
    nomad, steward, pulse = make_project("Nomad"), make_project("Steward"), make_project("Pulse")
    save_rows(admin, [
        {"type": "pair", "mainProjectId": steward, "secondProjectId": pulse, "largeSide": "left"},
        {"type": "feature", "mainProjectId": nomad},
    ])
    assert titles_on_page(client) == ["Steward", "Pulse", "Nomad"]


def test_a_published_project_that_is_not_in_a_row_is_added_at_the_end(admin, client, make_project):
    nomad = make_project("Nomad")
    make_project("Brand New")
    save_rows(admin, [{"type": "feature", "mainProjectId": nomad}])
    assert titles_on_page(client) == ["Nomad", "Brand New"]


def test_a_published_project_paired_with_a_draft_still_appears(admin, client, make_project):
    # The bug the code review found: the row is hidden because of the draft, and the
    # published project used to disappear with it.
    draft = make_project("Draft Large", published=False)
    published = make_project("Published Small")
    save_rows(admin, [{"type": "pair", "mainProjectId": draft, "secondProjectId": published, "largeSide": "left"}])
    assert titles_on_page(client) == ["Published Small"]


def test_a_row_cannot_point_at_a_case_study(admin):
    case_study = admin.post("/api/admin/entries", json={"kind": "case_study", "title": "Study"}).json()
    response = admin.put("/api/admin/projects-page-rows", json=[{"type": "feature", "mainProjectId": case_study["id"]}])
    assert response.status_code == 400
