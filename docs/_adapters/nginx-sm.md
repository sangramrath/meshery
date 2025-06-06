---
layout: default
title: Meshery Adapter for NGINX Service Mesh
name: Meshery Adapter for NGINX Service Mesh
component: NGINX Service Mesh
earliest_version: v1.2.0
port: 10010/gRPC
project_status: stable
github_link: https://github.com/meshery/meshery-nginx-sm
image: /assets/img/service-meshes/nginx-sm.svg
white_image: /assets/img/service-meshes/nginx-sm-white.svg
permalink: extensibility/adapters/nginx-sm
redirect_from: service-meshes/adapters/nginx-sm
language: en
---

{% assign sorted_tests_group = site.compatibility | group_by: "meshery-component" %}
{% for group in sorted_tests_group %}
      {% if group.name == "meshery-nginx-sm" %}
        {% assign items = group.items | sort: "meshery-component-version" | reverse %}
        {% for item in items %}
          {% if item.meshery-component-version != "edge" %}
            {% if item.overall-status == "passing" %}
              {% assign adapter_version_dynamic = item.meshery-component-version %}
              {% break %}
            {% elsif item.overall-status == "failing" %}
              {% continue %}
            {% endif %}
          {% endif %}
        {% endfor %} 
      {% endif %}
{% endfor %}

{% include compatibility/adapter-status.html %}

The {{ page.name }} is currently under construction ({{ page.project_status }} state). Want to contribute? Check our [progress]({{page.github_link}}).

## Lifecycle management

The {{page.name}} can install **{{page.earliest_version}}** of {{page.component}} ewE E . A number of sample applications can be installed using the {{page.name}}.

### Features

1. Lifecycle management of {{page.component}}
1. Lifecycle management of sample applications
1. Performance testing

### Sample Applications

The {{ page.name }} includes a handful of sample applications. Use Meshery to deploy any of these sample applications.

- [Emojivoto]({{site.baseurl}}/guides/infrastructure-management/sample-apps)

  - A microservice application that allows users to vote for their favorite emoji, and tracks votes received on a leaderboard.

- [Bookinfo]({{site.baseurl}}/guides/infrastructure-management/sample-apps)

- [Httpbin]({{site.baseurl}}/guides/infrastructure-management/sample-apps)

  - Httpbin is a simple HTTP request and response service.

- [NGINX Books](https://github.com/BuoyantIO/booksapp)
  - Application that helps you manage your bookshelf.

Identify overhead involved in running {{page.component}}, various {{page.component}} configurations while running different workloads and on different infrastructure. The adapter facilitates data plane and control plane performance testing.

1. Prometheus integration
1. Grafana integration


